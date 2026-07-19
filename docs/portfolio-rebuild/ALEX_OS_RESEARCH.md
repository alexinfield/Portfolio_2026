# Alex OS: Authentic Emulation Direction

Date: 2026-07-19

## What the reference actually does

`https://os.ryo.lu` is a web-built desktop environment rather than one emulated modern Mac. Its browser-native desktop gains genuine execution by launching specialist emulators such as Infinite Mac and v86/js-dos.

Primary references:

- ryOS source: https://github.com/ryokun6/ryos
- ryOS virtual-computer architecture: https://os.ryo.lu/docs/virtual-pc
- Infinite Mac embed guide: https://infinitemac.org/embed-docs
- Infinite Mac embed generator: https://infinitemac.org/embed

## Nostalgia target and practical boundary

If eighth grade ended in spring 2017, fourth grade maps primarily to the 2012–2013 Mountain Lion era and fifth grade to the Mountain Lion/Mavericks transition. A genuine public Mountain Lion or Mavericks browser guest is not currently a practical static-site target: the available open web emulators do not supply that exact combination of hardware support, guest software, and licensing-safe distribution.

The selected fallback is therefore Mac OS 9.0 on a Power Macintosh 9500 profile. It is older than the target era, but it provides the complete, functional quality requested: a real boot process, Finder, system software, period applications, and games through Infinite HD.

## Implemented architecture

1. The portfolio navigation launches Alex OS as its own full-screen experience.
2. The outer environment is a custom public archive computer with Finder, desktop, Dock, music, video, and portfolio links.
3. Finder reflects only safe public categories: Creative, Projects, RISD, Media, and Archive.
4. The Classic Mac application launches this official Infinite Mac configuration:
   `https://infinitemac.org/embed?disk=Mac+OS+9.0&infinite_hd=true&machine=Power+Macintosh+9500&auto_pause=true`
5. Personal files are never passed into the guest. Modern media and project content remains in fast web-native viewers.

This architecture preserves the convincing computer experience demonstrated by ryOS while remaining maintainable on GitHub Pages and honest about which layer is genuinely emulated.

## Content rule

Future Finder additions must be curated explicitly for publication. Do not mirror a local drive or Google Drive tree automatically, publish account names or paths, or expose raw personal files. Add one approved public folder or artifact at a time.
