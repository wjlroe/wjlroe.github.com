---
layout: post
title: Multi-Machine Vagrant Ansible Gotcha
date: 2014-12-30 16:00
categories: [vagrant, virtualbox, ansible]
---

[Vagrant][] is a fantastic tool for defining how virtual instances are
to be run and provisioned. I've used Vagrant with [Chef-Solo][] and
[Ansible][] provisioners and it's helped me understand those tools and
iterate quickly. There are some gotchas however and in this post I
will explore a particular flaw in the way Vagrant and Ansible
cooperate.
<!--more-->

## Multi-machine setup

Let's begin by defining a Vagrant environment that we will play with
(you will need [VirtualBox][], Vagrant and Ansible installed):

```bash
mkdir multi-vagrant-ansible
cd multi-vagrant-ansible
vagrant init
```

This will create a `Vagrantfile` in the current directory with
commented contents. Let's cut it back to the essentials and add in a
URL for the base box ([Ubuntu Trusty][ubuntu-cloud] is the latest LTS
release so that's what I'll use):

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "trusty64"
  config.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
  config.vm.network "private_network", type: "dhcp"
end
```

If we run Vagrant now, it'll clone that base box (downloading it first
if it hasn't already done so) and boot it up. This is already quicker
than downloading an ISO, creating a new VirtualBox instance, booting
that up and going through the installation procedure.

Let's define some machines and set them up to be provisioned by
Ansible. We'll have two web servers and one load balancer, because
that's boringly conventional:

```ruby
  config.vm.define "ariadne" do |ariadne|
    ariadne.vm.provision "ansible" do |ansible|
      ansible.playbook = "loadbalancer.yml"
      ansible.sudo = true
    end
  end

  config.vm.define "minos" do |minos|
    minos.vm.provision "ansible" do |ansible|
      ansible.playbook = "webserver.yml"
      ansible.sudo = true
    end
  end

  config.vm.define "pasiphae" do |pasiphae|
    pasiphae.vm.provision "ansible" do |ansible|
      ansible.playbook = "webserver.yml"
      ansible.sudo = true
    end
  end
```

So in the above, `minos` and `pasiphae` are web servers (i.e. they
will be running [nginx][]) and `ariadne` is the load balancer. The
location of the ansible playbooks are relative to the Vagrantfile so
in the same directory we will create `webserver.yml` with the
following contents:

```yaml
---

- hosts: all
  tasks:
    - apt: name=nginx state=present
    - service: name=nginx state=started
```

Which ensures that nginx is not only installed but also running (it'll
also mean that if that server is rebooted, it'll still run nginx).

Now for the load balancer, `loadbalancer.yml`:

```yaml
---

- hosts: all
  tasks:
    - apt: name=haproxy state=present
    - service: name=haproxy state=started
```

Which ensures [haproxy][] is installed and running in the same way.

These two playbooks are not aware of each other, they act
independently and you could use `ansible-playbook` to provision any
server you liked with them.

If you run `vagrant up` at this point (assuming you've not done that
with this Vagrantfile before), it'll boot up new VirtualBox instances
and provision them with ansible, installing the necessary software
etc. All well and good so far.

## Ansible facts

Ansible starts off by collecting facts about the nodes it'll run on.
It does this so that you can use information about the node in your
playbooks, roles and tasks.

To see the kind of facts that ansible collects about a node, you can
run ansible's `setup` module like this (for the minos instance):

```bash
ansible -i .vagrant/provisioners/ansible/inventory/vagrant_ansible_inventory -m setup -u vagrant --private-key=.vagrant/machines/minos/virtualbox/private_key minos
```

The above command should print out a large JSON structure of all the
facts ansible has collected about that node. Ansible facts are
somewhat extensible so it can include information gathered using the
[Ohai][] or [Facter][] tools.

The facts relevant to our example are under the `ansible_eth1`
key and they include an IPv4 address - which will come in handy in a
moment.

## Facts & templates

Now let's create a [template][ansible-template] for the haproxy configuration (in
`templates/haproxy.cfg.j2`):

{% include_code Haproxy config lang:jinja haproxy.cfg.j2 %}

We'll also need to ensure that template gets used in the loadbalancer
playbook:

```yaml
---

- hosts: all
  tasks:
    - apt: name=haproxy state=present
    - service: name=haproxy state=started
    - name: Configure haproxy
      template: src=templates/haproxy.cfg.j2 dest=/etc/haproxy/haproxy.cfg
```

If we run this now, we'll get a cryptic error:

`fatal: [ariadne] => {'msg': "AnsibleUndefinedVariable: One or more undefined variables: 'dict object' has no attribute 'webservers'", 'failed': True}`

One possible reason for this is that we haven't defined any groups for
our vagrant instances, let's do that now. We'll start by defining the
groups at the top of the Vagrantfile, before anything else (but after
the emacs/vi mode comments):

```ruby
groups = {
  "webservers" => ["minos", "pasiphae"],
  "loadbalancers" => ["ariadne"],
  "all_groups:children" => ["webservers", "loadbalancers"]
}
```

This correlates to the playbooks we've assigned for each node in the
Vagrantfile. Then we need to refer to that variable in each of our
machine definitions, adding a line that says `ansible.groups =
groups`, so the modified ariadne definition should now be:

```ruby
  config.vm.define "ariadne" do |ariadne|
    ariadne.vm.provision "ansible" do |ansible|
      ansible.playbook = "loadbalancer.yml"
      ansible.sudo = true
      ansible.groups = groups
    end
  end
```

If we run `vagrant provision` now we get a different error! Ah Ha!
Progress:

`fatal: [ariadne] => {'msg': "AnsibleUndefinedVariable: One or more undefined variables: 'dict object' has no attribute 'ansible_eth1'", 'failed': True}`

## Oh no!

It would be useful at this point to examine what we _do_ have in that
dictionary object. Maybe I mistyped the key? In order to do that, we
can add a debug line above the haproxy configuration line in the
`loadbalancer.yml` file, like this: `- debug: var=hostvars['minos']`.

When we run `vagrant provision` now, we will get the facts about minos
printed in JSON to the console. It'll look something like this:

```json
{
  "hostvars['minos']": {
    "inventory_hostname_short": "minos",
    "inventory_hostname": "minos",
    "group_names": [
      "all_groups",
      "webservers"
    ],
    "ansible_ssh_port": 2200,
    "ansible_ssh_host": "127.0.0.1"
  }
}
```

Clearly all those facts gathered aren't here. Why? The reason for this
is that Vagrant runs provisioning separately on each virtual machine -
so each ansible run is not aware of anything from another ansible
run. If you look this up online, you will find apparent answers to
this problem that reconfigure vagrant to connect to all hosts when
doing an ansible run. Let's do that now.

For each ansible block in the Vagrantfile, add the line:
`ansible.limit = 'all'`. Let's try `vagrant provision` again now
that's in place.

The error that I get after making this change is that SSH is failing.
If we add `ansible.verbose = 'vvvv'` to each ansible block in the
Vagrantfile then with a lot of scrolling around we can deduce that
ansible is attempting to connect to each machine in the inventory
using the same private key as it would for the machine it's currently
provisioning. In other words, while provisioning `ariadne`, it uses
the `ariadne` private SSH key to log on to both the other servers.
This won't work of course because those SSH keys are generated by
Vagrant per machine. Not only that but the private key is on the host
machine, not on the guests so it's a fools errand.

I'm not sure what kind of SSH key setup would allow `ansible.limit =
'all'` to work at all, but it's hardly straightforward.

## Potential workaround: Redis

The only way I've discovered to have ansible and Vagrant work well
together is to use [Fact Caching][]. This allows ansible to cache all
facts from a node in Redis (or memcached) so that nodes can refer to
each other without requiring an extra ssh connection for every node.

In order to enable fact caching, you will need Redis installed and
running. Then create an `ansible.cfg` file in the same directory as
your Vagrantfile, with the following contents:

```cfg
[defaults]
fact_caching = redis
fact_caching_timeout = 86400
```

You will need to provision `minos` and `pasiphae` first so that their
facts are stored in Redis before provisioning `ariadne` (because it
refers to those other nodes):

```bash
vagrant provision minos
vagrant provision pasiphae
```

Now that those facts have been gathered, we can run `vagrant
provision` and it should complete without trouble this time.

Now to verify that the haproxy config has been written as we expect,
we can run `vagrant ssh ariadne -- cat /etc/haproxy/haproxy.cfg` and
get something akin to:

```text
backend web-backend
  balance roundrobin
  mode http
    server minos 172.28.128.4:80 check
    server pasiphae 172.28.128.5:80 check
```

It worked! So although fact caching is intended for use in large
organisations with thousands of nodes (possibly in disparate data
centres) to speed up deployment, it can be handy working around
weaknesses in the vagrant+ansible combination.

[fact caching]: http://docs.ansible.com/playbooks_variables.html#fact-caching
[ohai]: https://github.com/opscode/ohai
[facter]: https://github.com/puppetlabs/facter
[vagrant]: https://docs.vagrantup.com/ "Vagrant"
[chef-solo]: https://docs.chef.io/chef_solo.html "Chef-solo"
[Ansible]: http://docs.ansible.com/index.html
[ubuntu-cloud]: https://cloud-images.ubuntu.com/vagrant/ "Ubuntu Cloud Vagrant images"
[nginx]: http://nginx.org
[haproxy]: http://www.haproxy.org
[VirtualBox]: https://www.virtualbox.org
[ansible-template]: http://docs.ansible.com/template_module.html
