require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connected to MongoDB Atlas');

  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared old data');

  const cats = await Category.insertMany([
    { name: 'Networking', slug: 'networking', icon: '🌐', description: 'Routers, Switches, Firewalls & Access Points', order: 1, isActive: true },
    { name: 'Server & Storage', slug: 'server-storage', icon: '🖥️', description: 'Servers, NAS, Enterprise Storage', order: 2, isActive: true },
    { name: 'Security & Antivirus', slug: 'security-antivirus', icon: '🛡️', description: 'Endpoint Security, Antivirus Software', order: 3, isActive: true },
    { name: 'Lifestyle & Wearables', slug: 'lifestyle-wearables', icon: '⌚', description: 'Smartwatch, TWS Earbuds, Accessories', order: 4, isActive: true },
    { name: 'IP Camera & CCTV', slug: 'ip-camera-cctv', icon: '📷', description: 'Surveillance Cameras & NVR Systems', order: 5, isActive: true },
  ]);
  const [net, srv, sec, life, cam] = cats;
  console.log('✅ Created 5 categories');

  await Product.insertMany([

    // ===== NETWORKING - ROUTERS =====
    {
      name: 'MikroTik RB750Gr3 hEX 5-Port Gigabit Router',
      slug: 'mikrotik-rb750gr3-hex-router',
      sku: 'MT-RB750GR3',
      description: 'MikroTik hEX RB750Gr3 is a five port Gigabit Ethernet router for locations where wireless connectivity is not required. Powered by a dual-core 880MHz CPU with 256MB RAM, running RouterOS v7. Supports advanced routing, firewall, VPN, hotspot, and bandwidth management. Official distributor: Global Brand PLC Bangladesh.',
      shortDescription: '5-Port Gigabit | 880MHz Dual-Core | RouterOS v7 | USB 3.0',
      price: 6500, originalPrice: 7200,
      category: net._id, brand: 'MikroTik',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      stock: 30,
      specifications: [
        { key: 'CPU', value: 'MT7621A Dual-Core 880MHz' },
        { key: 'RAM', value: '256MB DDR3' },
        { key: 'Storage', value: '16MB Flash' },
        { key: 'Ports', value: '5x Gigabit Ethernet' },
        { key: 'USB', value: '1x USB 3.0' },
        { key: 'RouterOS', value: 'v7 License L4' },
        { key: 'Power', value: '8-30V DC / Passive PoE-in' },
        { key: 'Dimensions', value: '113 x 89 x 28mm' }
      ],
      warranty: '1 Year', isFeatured: true, isNewArrival: false,
      rating: 4.8, reviewCount: 214, sold: 542, status: 'active',
      tags: ['router', 'mikrotik', 'hex', 'gigabit', 'networking']
    },
    {
      name: 'MikroTik hAP ac³ Dual-Band WiFi Router',
      slug: 'mikrotik-hap-ac3-dual-band-router',
      sku: 'MT-RBD53iG',
      description: 'MikroTik hAP ac³ is a powerful dual-band home access point with Gigabit Ethernet ports. Features 716MHz quad-core CPU, 256MB RAM, and simultaneous 2.4GHz + 5GHz 802.11ac WiFi. Ideal for homes and small offices needing high-speed wireless and wired connectivity.',
      shortDescription: 'Dual-Band AC WiFi | Quad-Core 716MHz | 5x Gigabit | RouterOS v7',
      price: 11500, originalPrice: 13000,
      category: net._id, brand: 'MikroTik',
      thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      stock: 20,
      specifications: [
        { key: 'CPU', value: 'IPQ-4018 Quad-Core 716MHz' },
        { key: 'RAM', value: '256MB' },
        { key: 'WiFi', value: '2.4GHz + 5GHz 802.11ac' },
        { key: 'Ports', value: '5x Gigabit Ethernet' },
        { key: 'USB', value: '1x USB 3.0' },
        { key: 'RouterOS', value: 'v7 License L4' },
        { key: 'Antennas', value: '3x 2.4GHz + 3x 5GHz Built-in' }
      ],
      warranty: '1 Year', isFeatured: true, isNewArrival: false,
      rating: 4.7, reviewCount: 98, sold: 213, status: 'active',
      tags: ['router', 'mikrotik', 'wifi', 'dual-band', 'ac', 'wireless']
    },
    {
      name: 'MikroTik CCR2004-1G-12S+2XS Cloud Core Router',
      slug: 'mikrotik-ccr2004-cloud-core-router',
      sku: 'MT-CCR2004',
      description: 'MikroTik CCR2004-1G-12S+2XS is a powerful enterprise-grade 1U rackmount router with 12x SFP+ 10G ports and 2x 25G SFP28 ports. Built on AL32400 quad-core 1.7GHz CPU with 4GB RAM. Ideal for ISPs and large enterprise networks requiring ultra-high throughput.',
      shortDescription: '1U Rack | 12x SFP+ 10G | 2x 25G SFP28 | 4GB RAM | Enterprise',
      price: 95000, originalPrice: 108000,
      category: net._id, brand: 'MikroTik',
      thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
      stock: 8,
      specifications: [
        { key: 'CPU', value: 'AL32400 Quad-Core 1.7GHz' },
        { key: 'RAM', value: '4GB DDR4' },
        { key: 'SFP+ Ports', value: '12x 10G SFP+' },
        { key: 'SFP28 Ports', value: '2x 25G SFP28' },
        { key: 'GE Port', value: '1x 10/100/1000 RJ45' },
        { key: 'Form Factor', value: '1U Rackmount' },
        { key: 'RouterOS', value: 'v7 License L6' },
        { key: 'Switching', value: '340 Gbps' }
      ],
      warranty: '1 Year', isFeatured: false, isNewArrival: true,
      rating: 4.9, reviewCount: 24, sold: 31, status: 'active',
      tags: ['router', 'mikrotik', 'ccr', 'enterprise', 'sfp', '10g', 'isp']
    },

    // ===== NETWORKING - SWITCHES =====
    {
      name: 'MikroTik CSS610-8G-2S+IN 8-Port Smart Switch',
      slug: 'mikrotik-css610-8g-2s-smart-switch',
      sku: 'MT-CSS610',
      description: 'MikroTik CSS610-8G-2S+IN is an 8-port Gigabit smart switch with 2x SFP+ 10G uplinks. Managed via SwOS and Winbox, supports 802.1Q VLANs, port mirroring, link aggregation, IGMP snooping, and spanning tree. Perfect desktop switch for small to medium offices.',
      shortDescription: '8x Gigabit + 2x SFP+ 10G | SwOS Managed | VLAN | Desktop/Rack',
      price: 8500, originalPrice: 9800,
      category: net._id, brand: 'MikroTik',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
      stock: 25,
      specifications: [
        { key: 'Ports', value: '8x Gigabit RJ45' },
        { key: 'Uplink', value: '2x SFP+ 10G' },
        { key: 'Switching Capacity', value: '36 Gbps' },
        { key: 'Management', value: 'SwOS / Winbox' },
        { key: 'VLAN', value: '802.1Q up to 4094' },
        { key: 'PoE', value: 'No' },
        { key: 'Form Factor', value: 'Desktop / Rackmount' }
      ],
      warranty: '1 Year', isFeatured: true, isNewArrival: false,
      rating: 4.7, reviewCount: 87, sold: 168, status: 'active',
      tags: ['switch', 'mikrotik', 'smart', 'sfp', 'gigabit', 'vlan']
    },
    {
      name: 'Cisco SG350-28 28-Port Gigabit Managed Switch',
      slug: 'cisco-sg350-28-managed-switch',
      sku: 'CISCO-SG350-28',
      description: 'Cisco SG350-28 offers Layer 2+ managed switching with 24x Gigabit ports, 2x Combo SFP, and 2x SFP uplinks. Features advanced QoS, 256 VLANs, ACL security, IPv6 support, and comprehensive web-based management. Ideal for growing SMBs requiring enterprise-level features.',
      shortDescription: '24x GE + 2x SFP Combo + 2x SFP | QoS | 256 VLAN | Layer 2+',
      price: 38000, originalPrice: 44000,
      category: net._id, brand: 'Cisco',
      thumbnail: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?w=400',
      stock: 12,
      specifications: [
        { key: 'Ports', value: '24x GE + 2x SFP Combo + 2x SFP' },
        { key: 'Switching Capacity', value: '56 Gbps' },
        { key: 'Forwarding Rate', value: '41.67 Mpps' },
        { key: 'VLAN', value: '256 VLANs' },
        { key: 'MAC Table', value: '16K entries' },
        { key: 'Management', value: 'Web / CLI / SNMP v1/v2/v3' },
        { key: 'Jumbo Frames', value: '9K bytes' }
      ],
      warranty: '1 Year Limited', isFeatured: true, isNewArrival: false,
      rating: 4.9, reviewCount: 56, sold: 78, status: 'active',
      tags: ['switch', 'cisco', 'managed', 'gigabit', 'smb', 'layer2']
    },

    // ===== NETWORKING - FIREWALL =====
    {
      name: 'WatchGuard Firebox T25 Next-Gen Firewall',
      slug: 'watchguard-firebox-t25-firewall',
      sku: 'WG-T25',
      description: 'WatchGuard Firebox T25 delivers enterprise-grade security for small businesses. Features 1 Gbps firewall throughput, unified threat management (UTM), SSL/TLS inspection, application control, IPS, and cloud management via WatchGuard Cloud. Authorized distributor: Global Brand PLC Bangladesh.',
      shortDescription: 'SMB NGFW | 1 Gbps | UTM | SSL Inspection | WatchGuard Cloud',
      price: 45000, originalPrice: 52000,
      category: net._id, brand: 'WatchGuard',
      thumbnail: 'https://images.unsplash.com/photo-1563991655280-cb95c90ca2fb?w=400',
      stock: 10,
      specifications: [
        { key: 'Firewall Throughput', value: '1 Gbps' },
        { key: 'UTM Throughput', value: '214 Mbps' },
        { key: 'VPN Throughput', value: '168 Mbps' },
        { key: 'Interfaces', value: '5x GbE' },
        { key: 'VPN Tunnels', value: '75 Branch Office VPN' },
        { key: 'Concurrent Sessions', value: '130,000' },
        { key: 'Management', value: 'WatchGuard Cloud / Local Web UI' }
      ],
      warranty: '1 Year Hardware', isFeatured: true, isNewArrival: false,
      rating: 4.8, reviewCount: 32, sold: 45, status: 'active',
      tags: ['firewall', 'watchguard', 'ngfw', 'utm', 'security', 'smb']
    },
    {
      name: 'WatchGuard Firebox T45 Next-Gen Firewall',
      slug: 'watchguard-firebox-t45-firewall',
      sku: 'WG-T45',
      description: 'WatchGuard Firebox T45 is a next-generation firewall designed for medium businesses. Delivers 4.0 Gbps firewall throughput with full UTM services including IPS, gateway antivirus, application control, and web filtering. Features 8x Gigabit ports and optional PoE.',
      shortDescription: 'Medium Business NGFW | 4 Gbps | 8x GbE | UTM | Optional PoE',
      price: 78000, originalPrice: 88000,
      category: net._id, brand: 'WatchGuard',
      thumbnail: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400',
      stock: 6,
      specifications: [
        { key: 'Firewall Throughput', value: '4.0 Gbps' },
        { key: 'UTM Throughput', value: '685 Mbps' },
        { key: 'VPN Throughput', value: '480 Mbps' },
        { key: 'Interfaces', value: '8x GbE (optional PoE)' },
        { key: 'VPN Tunnels', value: '100 Branch Office VPN' },
        { key: 'Concurrent Sessions', value: '1.3 Million' },
        { key: 'Management', value: 'WatchGuard Cloud' }
      ],
      warranty: '1 Year Hardware', isFeatured: false, isNewArrival: true,
      rating: 4.9, reviewCount: 18, sold: 22, status: 'active',
      tags: ['firewall', 'watchguard', 'ngfw', 'utm', 'enterprise', 'poe']
    },

    // ===== SERVER & STORAGE =====
    {
      name: 'Dell PowerEdge T150 Tower Server',
      slug: 'dell-poweredge-t150-tower-server',
      sku: 'DELL-T150',
      description: 'Dell PowerEdge T150 is the ideal entry-level tower server for small and medium businesses. Powered by Intel Xeon E-2314 with ECC memory support. Includes iDRAC9 for remote management. Authorized Dell distributor in Bangladesh: Global Brand PLC.',
      shortDescription: 'Entry Tower Server | Intel Xeon E-2314 | 16GB ECC | iDRAC9 | 4x LFF',
      price: 148000, originalPrice: 168000,
      category: srv._id, brand: 'Dell',
      thumbnail: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400',
      stock: 5,
      specifications: [
        { key: 'CPU', value: 'Intel Xeon E-2314 (4C/4T, 2.8GHz)' },
        { key: 'RAM', value: '16GB DDR4 ECC (Up to 128GB)' },
        { key: 'Storage Bays', value: '4x 3.5" LFF SATA/SAS' },
        { key: 'HDD Included', value: '1TB SATA 7200RPM' },
        { key: 'RAID', value: 'PERC H355 Adapter' },
        { key: 'Network', value: '1x Broadcom 5720 Dual-Port GbE' },
        { key: 'Management', value: 'iDRAC9 Basic' },
        { key: 'Power Supply', value: '300W Non-Redundant PSU' }
      ],
      warranty: '3 Years ProSupport', isFeatured: true, isNewArrival: false,
      rating: 4.8, reviewCount: 28, sold: 34, status: 'active',
      tags: ['server', 'dell', 'poweredge', 'tower', 'xeon', 'ecc']
    },
    {
      name: 'Dell PowerEdge R350 1U Rack Server',
      slug: 'dell-poweredge-r350-rack-server',
      sku: 'DELL-R350',
      description: 'Dell PowerEdge R350 is a versatile 1U rack server for remote office and edge computing deployments. Features Intel Xeon E-2336 6-core processor, up to 128GB ECC RAM, 8x 2.5" SFF bays, and comprehensive iDRAC9 Express remote management.',
      shortDescription: '1U Rack | Intel Xeon E-2336 6C | Up to 128GB ECC | 8x SFF | iDRAC9',
      price: 215000, originalPrice: 245000,
      category: srv._id, brand: 'Dell',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      stock: 4,
      specifications: [
        { key: 'CPU', value: 'Intel Xeon E-2336 (6C/12T, 2.9GHz)' },
        { key: 'RAM', value: '16GB DDR4 ECC (Up to 128GB)' },
        { key: 'Storage Bays', value: '8x 2.5" SFF SAS/SATA' },
        { key: 'Form Factor', value: '1U Rackmount' },
        { key: 'RAID', value: 'PERC H755 SAS' },
        { key: 'Network', value: '2x Broadcom 5720 Dual-Port GbE' },
        { key: 'Management', value: 'iDRAC9 Express' },
        { key: 'Power Supply', value: '600W Redundant PSU' }
      ],
      warranty: '3 Years ProSupport', isFeatured: false, isNewArrival: true,
      rating: 4.9, reviewCount: 14, sold: 18, status: 'active',
      tags: ['server', 'dell', 'rack', '1u', 'poweredge', 'redundant']
    },
    {
      name: 'Synology DS923+ 4-Bay NAS Storage',
      slug: 'synology-ds923-plus-nas',
      sku: 'SYN-DS923PLUS',
      description: 'Synology DS923+ is a powerful 4-bay NAS for small and medium businesses. AMD Ryzen R1600 dual-core CPU, 4GB ECC RAM expandable to 32GB, expandable to 9 drives via DX517. Supports 10GbE via PCIe expansion. Ideal for file sharing, backup, surveillance, and virtualization.',
      shortDescription: '4-Bay NAS | AMD Ryzen R1600 | 4GB ECC | PCIe 10GbE | DSM 7.2',
      price: 72000, originalPrice: 82000,
      category: srv._id, brand: 'Synology',
      thumbnail: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400',
      stock: 10,
      specifications: [
        { key: 'CPU', value: 'AMD Ryzen R1600 Dual-Core 2.6GHz' },
        { key: 'RAM', value: '4GB ECC DDR4 (Max 32GB)' },
        { key: 'Drive Bays', value: '4x 3.5"/2.5" SATA' },
        { key: 'M.2 Slots', value: '2x M.2 2280 NVMe SSD' },
        { key: 'LAN', value: '2x GbE (10GbE via PCIe)' },
        { key: 'PCIe', value: '1x PCIe 3.0 x2' },
        { key: 'USB', value: '3x USB 3.2 Gen 1' },
        { key: 'OS', value: 'DiskStation Manager (DSM) 7.2' }
      ],
      warranty: '3 Years', isFeatured: true, isNewArrival: false,
      rating: 4.9, reviewCount: 42, sold: 65, status: 'active',
      tags: ['nas', 'synology', 'storage', 'server', 'backup', '4bay']
    },
    {
      name: 'Synology DS1522+ 5-Bay NAS Storage',
      slug: 'synology-ds1522-plus-nas',
      sku: 'SYN-DS1522PLUS',
      description: 'Synology DS1522+ is a high-performance 5-bay NAS for teams needing large storage capacity. AMD Ryzen R1600, 8GB ECC RAM expandable to 32GB, expandable to 15 bays. Dual PCIe slots for 10GbE and NVMe cache. Perfect for growing businesses.',
      shortDescription: '5-Bay NAS | AMD Ryzen | 8GB ECC | Expandable to 15 Bays | Dual PCIe',
      price: 98000, originalPrice: 112000,
      category: srv._id, brand: 'Synology',
      thumbnail: 'https://images.unsplash.com/photo-1563991655280-cb95c90ca2fb?w=400',
      stock: 6,
      specifications: [
        { key: 'CPU', value: 'AMD Ryzen R1600 Dual-Core' },
        { key: 'RAM', value: '8GB ECC DDR4 (Max 32GB)' },
        { key: 'Drive Bays', value: '5x 3.5"/2.5" SATA' },
        { key: 'Expandable', value: 'Up to 15 bays via DX517' },
        { key: 'LAN', value: '4x GbE (10GbE via PCIe)' },
        { key: 'PCIe', value: '2x PCIe 3.0' },
        { key: 'USB', value: '2x USB 3.2 Gen 1 + 1x USB-C' }
      ],
      warranty: '3 Years', isFeatured: false, isNewArrival: false,
      rating: 4.8, reviewCount: 19, sold: 28, status: 'active',
      tags: ['nas', 'synology', 'storage', '5bay', 'enterprise', 'expandable']
    },
    {
      name: 'Seagate Exos X18 18TB Enterprise Hard Drive',
      slug: 'seagate-exos-x18-18tb-hdd',
      sku: 'SG-EXOSX18-18TB',
      description: 'Seagate Exos X18 18TB is a purpose-built enterprise hard drive for hyperscale data centers. 7200RPM with 256MB cache, 550TB/year workload rating, and 2.5 million hour MTBF. Supports 24/7 operation in demanding RAID and NAS environments.',
      shortDescription: '18TB Enterprise HDD | SATA 6Gb/s | 7200RPM | 256MB Cache | 5-Year Warranty',
      price: 32000, originalPrice: 36500,
      category: srv._id, brand: 'Seagate',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
      stock: 35,
      specifications: [
        { key: 'Capacity', value: '18TB' },
        { key: 'Interface', value: 'SATA 6Gb/s' },
        { key: 'RPM', value: '7200 RPM' },
        { key: 'Cache', value: '256MB' },
        { key: 'Workload Rate', value: '550TB/Year' },
        { key: 'MTBF', value: '2.5 Million Hours' },
        { key: 'Form Factor', value: '3.5 inch' },
        { key: 'Encryption', value: 'Optional SED / SED-FIPS' }
      ],
      warranty: '5 Years', isFeatured: false, isNewArrival: false,
      rating: 4.7, reviewCount: 76, sold: 198, status: 'active',
      tags: ['hdd', 'seagate', 'exos', 'enterprise', 'storage', '18tb', 'nas']
    },

    // ===== SECURITY & ANTIVIRUS =====
    {
      name: 'Panda Dome Advanced 1 Device 1 Year',
      slug: 'panda-dome-advanced-1device-1year',
      sku: 'PANDA-ADV-1D-1Y',
      description: 'Panda Dome Advanced provides comprehensive protection for 1 device for 1 year. Includes real-time antivirus, Wi-Fi protection, USB vaccination, VPN (150MB/day), parental controls, anti-theft for mobile, and identity protection. Supports Windows, Mac, Android, and iOS. Exclusive distributor in Bangladesh: Global Brand PLC.',
      shortDescription: '1 Device | 1 Year | Real-Time AV | VPN 150MB | Parental Control',
      price: 1100, originalPrice: 1400,
      category: sec._id, brand: 'Panda Security',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
      stock: 200,
      specifications: [
        { key: 'Devices', value: '1 Device' },
        { key: 'Duration', value: '1 Year' },
        { key: 'Platform', value: 'Windows, Mac, Android, iOS' },
        { key: 'VPN', value: '150MB/day included' },
        { key: 'Parental Control', value: 'Included' },
        { key: 'Anti-Theft', value: 'Included (mobile)' },
        { key: 'Wi-Fi Protection', value: 'Included' }
      ],
      warranty: 'License Period', isFeatured: false, isNewArrival: false,
      rating: 4.5, reviewCount: 312, sold: 876, status: 'active',
      tags: ['antivirus', 'panda', 'dome', 'advanced', '1device', 'security']
    },
    {
      name: 'Panda Dome Advanced 3 Devices 1 Year',
      slug: 'panda-dome-advanced-3device-1year',
      sku: 'PANDA-ADV-3D-1Y',
      description: 'Panda Dome Advanced protects 3 devices for 1 year. Complete protection including real-time antivirus, ransomware shield, Wi-Fi protection, USB vaccination, VPN (150MB/day/device), parental controls, advanced firewall, and identity protection. Exclusive distributor: Global Brand PLC Bangladesh.',
      shortDescription: '3 Devices | 1 Year | Ransomware Shield | VPN | Advanced Firewall',
      price: 2200, originalPrice: 2800,
      category: sec._id, brand: 'Panda Security',
      thumbnail: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400',
      stock: 150,
      specifications: [
        { key: 'Devices', value: '3 Devices' },
        { key: 'Duration', value: '1 Year' },
        { key: 'Platform', value: 'Windows, Mac, Android, iOS' },
        { key: 'VPN', value: '150MB/day per device' },
        { key: 'Ransomware Shield', value: 'Included' },
        { key: 'Advanced Firewall', value: 'Included' },
        { key: 'USB Vaccination', value: 'Included' }
      ],
      warranty: 'License Period', isFeatured: true, isNewArrival: false,
      rating: 4.7, reviewCount: 198, sold: 542, status: 'active',
      tags: ['antivirus', 'panda', 'dome', '3device', 'ransomware', 'security']
    },
    {
      name: 'Panda Dome Complete 5 Devices 1 Year',
      slug: 'panda-dome-complete-5device-1year',
      sku: 'PANDA-COMP-5D-1Y',
      description: 'Panda Dome Complete is the ultimate all-in-one security suite for 5 devices. Includes antivirus, unlimited VPN, password manager, data shield, PC cleanup optimizer, parental controls, anti-theft, identity protection, and premium 24/7 customer support.',
      shortDescription: '5 Devices | 1 Year | Unlimited VPN | Password Manager | PC Optimizer',
      price: 4500, originalPrice: 5800,
      category: sec._id, brand: 'Panda Security',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
      stock: 120,
      specifications: [
        { key: 'Devices', value: '5 Devices' },
        { key: 'Duration', value: '1 Year' },
        { key: 'VPN', value: 'Unlimited VPN (no daily limit)' },
        { key: 'Password Manager', value: 'Included' },
        { key: 'Data Shield', value: 'Included' },
        { key: 'PC Optimizer', value: 'Cleanup & Tune-Up Tools' },
        { key: 'Platform', value: 'Windows, Mac, Android, iOS' }
      ],
      warranty: 'License Period', isFeatured: true, isNewArrival: true,
      rating: 4.8, reviewCount: 134, sold: 321, status: 'active',
      tags: ['antivirus', 'panda', 'dome', 'complete', 'vpn', '5device', 'unlimited']
    },
    {
      name: 'Panda Endpoint Protection Plus 25 Users 1 Year',
      slug: 'panda-endpoint-protection-plus-25users',
      sku: 'PANDA-EPP-25U-1Y',
      description: 'Panda Endpoint Protection Plus provides enterprise-grade endpoint security for 25 workstations, laptops, servers, and Android devices. Centralized cloud management via Aether platform, real-time threat intelligence, URL filtering, device control, and comprehensive security reporting.',
      shortDescription: '25 Users | 1 Year | Aether Cloud Managed | EPP | Web Filter | Device Control',
      price: 62000, originalPrice: 72000,
      category: sec._id, brand: 'Panda Security',
      thumbnail: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400',
      stock: 50,
      specifications: [
        { key: 'Users', value: '25 Devices/Endpoints' },
        { key: 'Duration', value: '1 Year' },
        { key: 'Platform', value: 'Windows, Mac, Linux, Android' },
        { key: 'Management', value: 'Aether Cloud Platform' },
        { key: 'Protection', value: 'EPP + Web Filtering + Device Control' },
        { key: 'Reporting', value: 'Advanced Security Reports & Alerts' },
        { key: 'Deployment', value: 'Cloud / On-Premise' }
      ],
      warranty: 'License Period', isFeatured: false, isNewArrival: false,
      rating: 4.9, reviewCount: 42, sold: 87, status: 'active',
      tags: ['antivirus', 'panda', 'endpoint', 'enterprise', 'business', 'epp', 'cloud']
    },

    // ===== LIFESTYLE & WEARABLES =====
    {
      name: 'Samsung Galaxy Watch 6 Classic 47mm Black',
      slug: 'samsung-galaxy-watch-6-classic-47mm-black',
      sku: 'SAM-GW6C-47-BK',
      description: 'Samsung Galaxy Watch 6 Classic 47mm brings back the iconic rotating bezel with advanced health monitoring. Features BioActive Sensor for ECG, blood pressure, body composition analysis, advanced sleep coaching, and Wear OS 4 with One UI Watch 5.5. Water resistant 5ATM + IP68.',
      shortDescription: '47mm | Rotating Bezel | ECG | BP | Body Composition | Wear OS 4',
      price: 39990, originalPrice: 44990,
      category: life._id, brand: 'Samsung',
      thumbnail: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
      stock: 20,
      specifications: [
        { key: 'Display', value: '1.5" Super AMOLED 480x480' },
        { key: 'Processor', value: 'Exynos W930 Dual-Core 1.4GHz' },
        { key: 'RAM / Storage', value: '2GB / 16GB' },
        { key: 'Battery', value: '425mAh' },
        { key: 'OS', value: 'Wear OS 4 + One UI Watch 5.5' },
        { key: 'GPS', value: 'GPS + GLONASS + BeiDou + Galileo' },
        { key: 'Health Sensors', value: 'ECG, BP, Body Composition, SpO2' },
        { key: 'Water Resistance', value: '5ATM + IP68 + MIL-STD-810H' }
      ],
      warranty: '1 Year Official', isFeatured: true, isNewArrival: false,
      rating: 4.7, reviewCount: 186, sold: 342, status: 'active',
      tags: ['smartwatch', 'samsung', 'galaxy', 'watch6', 'ecg', 'wearable']
    },
    {
      name: 'Samsung Galaxy Watch FE 40mm Smartwatch',
      slug: 'samsung-galaxy-watch-fe-40mm',
      sku: 'SAM-GWFE-40',
      description: 'Samsung Galaxy Watch FE delivers the essential Galaxy Watch experience at an accessible price. Features ECG monitoring, sleep analysis, personalized heart rate zones, Samsung Pay, and compatibility with Android phones. Perfect entry point into the Galaxy Watch ecosystem.',
      shortDescription: '40mm | ECG | Sleep Analysis | Samsung Pay | Heart Rate Zones',
      price: 20500, originalPrice: 23500,
      category: life._id, brand: 'Samsung',
      thumbnail: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
      stock: 25,
      specifications: [
        { key: 'Display', value: '1.2" Super AMOLED 396x396' },
        { key: 'Battery', value: '247mAh' },
        { key: 'OS', value: 'Wear OS 3.5' },
        { key: 'GPS', value: 'GPS + GLONASS + Beidou' },
        { key: 'Health Sensors', value: 'ECG, SpO2, Heart Rate, Stress' },
        { key: 'Water Resistance', value: '5ATM + IP68' },
        { key: 'Storage', value: '16GB' }
      ],
      warranty: '1 Year Official', isFeatured: false, isNewArrival: false,
      rating: 4.5, reviewCount: 98, sold: 178, status: 'active',
      tags: ['smartwatch', 'samsung', 'galaxy', 'watch', 'ecg', 'affordable']
    },
    {
      name: 'Sony WF-1000XM5 True Wireless Earbuds',
      slug: 'sony-wf-1000xm5-earbuds',
      sku: 'SONY-WF1000XM5-BK',
      description: 'Sony WF-1000XM5 features industry-leading noise cancellation with a new 8.4mm driver and dual processors (Integrated Processor V2 + QN2e chip). Delivers Hi-Res Audio with LDAC, 360 Reality Audio, Speak-to-Chat, and adaptive sound control. 24 total hours battery life.',
      shortDescription: 'Industry-Leading ANC | LDAC Hi-Res | 8.4mm Driver | 8+16hr Battery',
      price: 32000, originalPrice: 36000,
      category: life._id, brand: 'Sony',
      thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      stock: 15,
      specifications: [
        { key: 'Driver', value: '8.4mm Dynamic Driver X' },
        { key: 'Processor', value: 'Integrated Processor V2 + QN2e' },
        { key: 'Battery', value: '8hr (Buds) + 16hr (Case) = 24hr Total' },
        { key: 'ANC', value: 'Industry-Leading Active Noise Cancellation' },
        { key: 'Audio Codec', value: 'LDAC, AAC, SBC' },
        { key: 'Bluetooth', value: '5.3 with Multipoint' },
        { key: 'Microphones', value: '5-mic Array with Beamforming' },
        { key: 'Water Resistance', value: 'IPX4' }
      ],
      warranty: '1 Year', isFeatured: true, isNewArrival: false,
      rating: 4.9, reviewCount: 412, sold: 687, status: 'active',
      tags: ['earbuds', 'sony', 'xm5', 'anc', 'ldac', 'wireless', 'tws']
    },
    {
      name: 'Apple AirPods Pro 2nd Generation USB-C',
      slug: 'apple-airpods-pro-2nd-gen-usbc',
      sku: 'APPLE-APP2-USBC',
      description: 'Apple AirPods Pro 2nd Generation with H2 chip delivers up to 2x more Active Noise Cancellation. Features Adaptive Audio that blends ANC and Transparency, Personalized Spatial Audio with dynamic head tracking, and Conversation Awareness. MagSafe Charging Case with USB-C.',
      shortDescription: 'H2 Chip | 2x More ANC | Adaptive Audio | Personalized Spatial Audio | USB-C',
      price: 27999, originalPrice: 31999,
      category: life._id, brand: 'Apple',
      thumbnail: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
      stock: 18,
      specifications: [
        { key: 'Chip', value: 'Apple H2' },
        { key: 'Battery', value: '6hr ANC on / 30hr with Case' },
        { key: 'ANC', value: 'Active Noise Cancellation (2x more)' },
        { key: 'Features', value: 'Adaptive Audio, Conversation Awareness' },
        { key: 'Spatial Audio', value: 'Personalized + Dynamic Head Tracking' },
        { key: 'Charging', value: 'MagSafe / USB-C / Apple Watch Charger' },
        { key: 'Bluetooth', value: '5.3' },
        { key: 'Water Resistance', value: 'IPX4 (Buds + Case)' }
      ],
      warranty: '1 Year', isFeatured: true, isNewArrival: false,
      rating: 4.8, reviewCount: 298, sold: 521, status: 'active',
      tags: ['earbuds', 'apple', 'airpods', 'pro', 'anc', 'usbc', 'h2']
    },

    // ===== IP CAMERA & CCTV =====
    {
      name: 'Uniview IPC3614SB-ADF28KM 4MP LightHunter Dome Camera',
      slug: 'uniview-ipc3614sb-4mp-lighthunter-dome',
      sku: 'UNV-IPC3614SB',
      description: 'Uniview IPC3614SB-ADF28KM 4MP LightHunter Fixed Dome IP Camera features 1/1.8" CMOS sensor, motorized 2.8-12mm auto-focus lens, Smart IR 50m, and H.265 compression. Deep learning-based SMD Plus for accurate human/vehicle detection. IP67 and IK10 rated.',
      shortDescription: '4MP LightHunter | Motorized 2.8-12mm | SMD Plus | IR 50m | IP67 IK10',
      price: 12500, originalPrice: 14500,
      category: cam._id, brand: 'Uniview',
      thumbnail: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?w=400',
      stock: 40,
      specifications: [
        { key: 'Resolution', value: '4MP (2560x1440) @ 30fps' },
        { key: 'Sensor', value: '1/1.8" Progressive Scan CMOS' },
        { key: 'Lens', value: 'Motorized 2.8-12mm Auto-Focus' },
        { key: 'IR Distance', value: '50 meters Smart IR' },
        { key: 'Compression', value: 'H.265 / H.264 / MJPEG' },
        { key: 'AI Detection', value: 'SMD Plus (Person + Vehicle)' },
        { key: 'Protection', value: 'IP67, IK10' },
        { key: 'Power', value: 'PoE 802.3af / DC 12V' }
      ],
      warranty: '2 Years', isFeatured: false, isNewArrival: false,
      rating: 4.6, reviewCount: 68, sold: 145, status: 'active',
      tags: ['camera', 'uniview', 'ip', 'cctv', '4mp', 'dome', 'lighthunter']
    },
    {
      name: 'Uniview NVR302-16E2-P16 16-Channel PoE NVR',
      slug: 'uniview-nvr302-16e2-p16-nvr',
      sku: 'UNV-NVR302-16E2-P16',
      description: 'Uniview NVR302-16E2-P16 supports 16-channel IP camera recording with a built-in 16-port PoE switch. Supports up to 12MP resolution, H.265 Ultra decoding, 2x SATA HDD bays (up to 8TB each), and AI-based smart detection including SMD and perimeter protection.',
      shortDescription: '16CH NVR | Built-in 16-Port PoE | 12MP | H.265 | 2x HDD | AI Detection',
      price: 28000, originalPrice: 32000,
      category: cam._id, brand: 'Uniview',
      thumbnail: 'https://images.unsplash.com/photo-1563991655280-cb95c90ca2fb?w=400',
      stock: 15,
      specifications: [
        { key: 'Channels', value: '16 IP Camera Channels' },
        { key: 'Max Resolution', value: '12MP (4000x3000)' },
        { key: 'PoE Ports', value: '16x PoE 802.3af/at' },
        { key: 'Total PoE Budget', value: '200W' },
        { key: 'HDD Bays', value: '2x SATA (Max 8TB each = 16TB)' },
        { key: 'Compression', value: 'H.265 Ultra / H.265 / H.264' },
        { key: 'Video Output', value: 'HDMI (4K) + VGA (1080p)' },
        { key: 'Decoding', value: '2x 4K or 8x 1080p Live View' }
      ],
      warranty: '2 Years', isFeatured: false, isNewArrival: false,
      rating: 4.7, reviewCount: 34, sold: 62, status: 'active',
      tags: ['nvr', 'uniview', 'poe', 'cctv', '16channel', 'recorder', 'ip']
    },

  ]);

  console.log('\n✅ Successfully added 22 real products!');
  console.log('\n📦 Summary:');
  console.log('  🌐 Networking: 7 products — MikroTik, Cisco, WatchGuard');
  console.log('     Router: RB750Gr3 (৳6,500) | hAP ac³ (৳11,500) | CCR2004 (৳95,000)');
  console.log('     Switch: CSS610 (৳8,500) | Cisco SG350-28 (৳38,000)');
  console.log('     Firewall: WatchGuard T25 (৳45,000) | T45 (৳78,000)');
  console.log('\n  🖥️  Server & Storage: 5 products — Dell, Synology, Seagate');
  console.log('     Server: Dell T150 (৳148,000) | Dell R350 (৳215,000)');
  console.log('     NAS: Synology DS923+ (৳72,000) | DS1522+ (৳98,000)');
  console.log('     HDD: Seagate Exos X18 18TB (৳32,000)');
  console.log('\n  🛡️  Security & Antivirus: 4 products — Panda Security');
  console.log('     Dome Advanced 1D (৳1,100) | 3D (৳2,200) | Complete 5D (৳4,500)');
  console.log('     Endpoint Protection Plus 25U (৳62,000)');
  console.log('\n  ⌚ Lifestyle & Wearables: 4 products — Samsung, Sony, Apple');
  console.log('     Galaxy Watch 6 Classic (৳39,990) | Galaxy Watch FE (৳20,500)');
  console.log('     Sony WF-1000XM5 (৳32,000) | Apple AirPods Pro 2 (৳27,999)');
  console.log('\n  📷 IP Camera & CCTV: 2 products — Uniview');
  console.log('     4MP Dome Camera (৳12,500) | 16CH PoE NVR (৳28,000)');
  console.log('\n🚀 Refresh http://localhost:3000 to see all products!');

  process.exit(0);
}).catch(e => {
  console.log('❌ Error:', e.message);
  process.exit(1);
});
