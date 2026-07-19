# Alex OS: Authentic Emulation Direction

Date: 2026-07-19

## What the reference actually does

`https://os.ryo.lu` is a web-built desktop environment, not a single emulated Mac operating system. Its outer Finder, windows, Dock, applications, and virtual file system are React/browser interfaces. It adds genuine execution through embedded specialist emulators:

- Infinite Mac runs classic Macintosh releases through Mac emulator cores compiled to WebAssembly.
- Virtual PC uses v86 for classic x86 operating systems and js-dos for DOS games.

This is why the reference can feel like a complete computer while still running games and old operating systems: the surrounding desktop and the emulated guests are separate layers.

Primary references:

- ryOS source and feature inventory: https://github.com/ryokun6/ryos
- ryOS Virtual PC architecture: https://os.ryo.lu/docs/virtual-pc
- Infinite Mac source: https://github.com/mihaip/infinite-mac
- Infinite Mac browser releases and embed/import support: https://infinitemac.org/
- v86 browser emulator: https://github.com/copy/v86

## Alex's fourth- and fifth-grade Mac era

If eighth grade ended in spring 2017, the school years map as follows:

- Fourth grade: 2012–2013. OS X Mountain Lion 10.8 was released in July 2012.
- Fifth grade: 2013–2014. It began in the Mountain Lion era and transitioned to OS X Mavericks 10.9 after October 22, 2013.

Mountain Lion is therefore the strongest single nostalgia target, with Mavericks also correct for fifth grade.

Primary references:

- Apple Mountain Lion release archive: https://www.apple.com/dk/newsroom/2012/06/11Mountain-Lion-Available-in-July-From-Mac-App-Store/
- Apple Mavericks release archive: https://www.apple.com/newsroom/2013/10/23OS-X-Mavericks-Available-Today-Free-from-the-Mac-App-Store/

## Why a genuine Mountain Lion or Mavericks guest is not the right web target

- Infinite Mac's currently published Mac OS X range reaches 10.4 Tiger, not 10.8 or 10.9.
- v86 explicitly lacks x86-64 extensions. Mountain Lion and Mavericks require later 64-bit Mac hardware and cannot use the v86 route that powers ryOS Virtual PC.
- A public portfolio would also need to distribute or stream Apple system software and application images under their applicable licenses. That should not be treated as an ordinary static-site asset pipeline.

This makes a browser-hosted Mountain Lion or Mavericks duplicate fragile technically and risky as a public dependency. It would also be far too heavy for the current static GitHub Pages portfolio.

## Recommended architecture

Build Alex OS as an authored archive computer with one honest emulation layer:

1. Keep the launcher in the portfolio's universal navigation.
2. Replace the current generic liquid-glass mock desktop with a restrained Mountain Lion-era archive interface based on Alex's own folders, files, music, video, RISD work, and experiments.
3. Make Infinite Mac a featured application inside that environment. Use a compatible classic Mac release so visitors can boot a real guest, launch compatible software and games, and import or mount curated files.
4. Keep Alex's everyday media and project files in lightweight web-native viewers so they load instantly and work on phones.
5. Add a PC/DOS emulator only if specific games or executable artifacts genuinely need it.

This produces the quality the reference demonstrates without pretending the outer shell is a real operating system. The emulator supplies the genuine computer moment; Alex's archive remains fast, controllable, and maintainable.

## Content and application constraint

A visitor can drag files into supported Infinite Mac guests and custom disk images can be prepared, but arbitrary modern macOS applications cannot simply be dropped into an older guest and run. Executables must match the emulated machine and operating-system architecture. Alex's modern audio, video, PDFs, and project folders should therefore stay in web-native applications, while the emulator receives a curated set of compatible software and artifacts.

## Implementation gate

Do not replace the current Alex OS yet. First approve one visual direction for the Mountain Lion-era archive shell and choose the real guest release/application set. Then integrate Infinite Mac as a bounded feature rather than importing the full ryOS codebase.
