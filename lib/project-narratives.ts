import type { ProjectSlug } from "@/lib/portfolio";

export type ProjectSectionNote = {
  eyebrow?: string;
  title?: string;
  body?: string;
  mobileMedia?: readonly string[];
  mobileLayout?: "grid" | "stack";
  hideCompositeOnMobile?: boolean;
};

export type ProjectNarrative = {
  figmaRootId: string;
  displayTitle: string;
  introduction: string;
  note?: string;
  metaLabel?: "Role" | "Type";
  meta: readonly string[];
  date: string;
  sections: readonly ProjectSectionNote[];
};

export const projectNarratives: Record<ProjectSlug, ProjectNarrative> = {
  "molekule-go": {
    figmaRootId: "9210:2",
    displayTitle: "Molekule Go",
    introduction:
      "A portable air purifier designed for the Molekule brand. Molekule Go provides the peace of mind of clean air wherever the user goes.",
    note: "This is a student project and is not affiliated with Molekule.",
    meta: [],
    date: "2025",
    sections: [
      { body: "Clean air is an essential factor for both physical health and mental well-being.", mobileMedia: ["/assets/figma-web/molekule-go/002-image87.jpg"] },
      { title: "Users want to feel confident in the air they breathe.", body: "Air purifiers give users an extra layer of security and peace of mind.", mobileMedia: ["/assets/figma-web/molekule-go/003-image.jpg", "/assets/figma-web/molekule-go/004-image85.jpg", "/assets/figma-web/molekule-go/005-image86.jpg"] },
      { body: "Meet Molekule—a product pioneer in air purification technology and research.", mobileMedia: ["/assets/figma-web/molekule-go/007-image89.jpg"] },
      { title: "Who is Molekule?", body: "Innovative research, polished design, and technology that eliminates pollutants instead of only capturing them.", mobileMedia: ["/assets/figma-web/molekule-go/008-image90.jpg", "/assets/figma-web/molekule-go/009-image91.jpg", "/assets/figma-web/molekule-go/010-image155.jpg", "/assets/figma-web/molekule-go/011-image156.jpg"] },
      { title: "Current offerings", body: "Pro serves homes and businesses; Mini brings compact purification to bedrooms and personal offices.", mobileMedia: ["/assets/figma-web/molekule-go/014-image75.jpg", "/assets/figma-web/molekule-go/015-image163.jpg", "/assets/figma-web/molekule-go/016-image161.jpg", "/assets/figma-web/molekule-go/017-image162.jpg"] },
      { title: "How might Molekule empower users to carry the peace of mind of clean air wherever they go?", mobileMedia: ["/assets/figma-web/molekule-go/018-image164.jpg"] },
      { eyebrow: "Design process", title: "Form ideation", body: "References and sketches explored new visual directions while staying grounded in Molekule’s design language.", mobileMedia: ["/assets/figma-web/molekule-go/019-process1.jpg", "/assets/figma-web/molekule-go/020-image165.jpg", "/assets/figma-web/molekule-go/021-image167.jpg", "/assets/figma-web/molekule-go/022-drawing-slide1.jpg"] },
      { title: "Meet the Molekule Go", mobileMedia: ["/assets/figma-web/molekule-go/023-v31.jpg"] },
      { body: "An air quality monitor and purifier, for peace of mind you can feel and see.", mobileMedia: ["/assets/figma-web/molekule-go/024-airflow-green1.jpg"] },
      { body: "Combined ultraviolet light and filtering sanitizes air." },
      { body: "Sensors monitor air quality and make it visible: good, moderate, or unhealthy." },
      { body: "The companion app provides more advanced air-quality information.", mobileMedia: ["/assets/figma-web/molekule-go/026-image93.jpg"] },
      { mobileMedia: ["/assets/figma-web/molekule-go/027-waterbottle1.jpg"] },
      { body: "The top swivels, allowing you to direct airflow.", mobileMedia: ["/assets/figma-web/molekule-go/028-angled202502181.jpg", "/assets/figma-web/molekule-go/031-top1.jpg"] },
      { mobileMedia: ["/assets/figma-web/molekule-go/032-blaclstiod-tag-up2202504131.jpg"] },
    ],
  },
  luma: {
    figmaRootId: "9210:1369",
    displayTitle: "Luma",
    introduction:
      "Luma is a dial designed to bring smart home controls into physical space, rather than depending on voice or phones.",
    metaLabel: "Type",
    meta: ["Research", "Prototyping", "Visualization"],
    date: "2024",
    sections: [
      { eyebrow: "Why", body: "Luma is a light switch upgrade that adds smart-home features to a familiar physical control." },
      {},
      { body: "Smart homes are confusing—not just for visitors, but even for those who live there." },
      { body: "Smart-home devices often rely on voice control and phones, which only work if you already know how to use them." },
      { body: "People expect physical controls for shared spaces." },
      { eyebrow: "Research", title: "Do actual homes reflect this?" },
      { eyebrow: "Field findings", body: "Only the homeowner knows how to interact with devices; visitors need to ask how to control lights." },
      { title: "How might we improve tactile controls in smart homes so interaction is not reliant on invisible interfaces?" },
      { eyebrow: "Criteria", title: "Familiar, intuitive, versatile" },
      {},
      {},
      {},
      { title: "Luma", body: "Smart-home controls in your space.", mobileMedia: ["/assets/figma-web/luma/002-heroish1.jpg"] },
      { body: "Control your lights from a familiar dial interface.", mobileMedia: ["/assets/figma-web/luma/003-hand-photo4.jpg"] },
      { body: "A swipe on the face switches functionality between devices in the same room.", mobileMedia: ["/assets/figma-web/luma/004-ecobee2.jpg", "/assets/figma-web/luma/005-ecobee3.jpg"] },
      {},
      { title: "Custom faces", body: "Light color, locks, temperature, and other devices can each have a dedicated control face.", mobileMedia: ["/assets/figma-web/luma/007-color11.jpg", "/assets/figma-web/luma/008-lock1-background-removed1.jpg", "/assets/figma-web/luma/009-temp1-background-removed1.jpg"], mobileLayout: "stack" },
      { body: "Configure Luma’s faces on your phone, then anyone can access controls within your space.", mobileMedia: ["/assets/figma-web/luma/010-image29.jpg"] },
      { mobileMedia: ["/assets/figma-web/luma/013-kitchen1.jpg"] },
      {},
    ],
  },
  niche: {
    figmaRootId: "5512:266",
    displayTitle: "Niche",
    introduction:
      "Niche is a furniture system for the workplace. It can scale from a video call booth down to a desk. It’s designed to help modern offices adapt as hybrid work changes the workplace.",
    note: "This is a school project.",
    metaLabel: "Type",
    meta: ["Research", "Prototyping", "Visualization"],
    date: "2024",
    sections: [
      { eyebrow: "Desk research", body: "Virtual meetings have stabilized far above pre-COVID levels, making solo calls a normal part of the workday.", mobileMedia: ["/assets/figma-web/niche/002-image123.jpg", "/assets/figma-web/niche/003-image124.jpg", "/assets/figma-web/niche/004-image125.jpg", "/assets/figma-web/niche/005-image134.jpg"] },
      { eyebrow: "Interview quotes", body: "Workers say offices don’t support solo calls, while employers see traditional phone booths as a waste of money and space.", mobileMedia: ["/assets/figma-web/niche/006-image87.jpg", "/assets/figma-web/niche/009-image133.jpg", "/assets/figma-web/niche/011-image95.jpg", "/assets/figma-web/niche/013-image94.jpg"] },
      { title: "Why the solo call struggles", body: "Solo calls are the lowest priority for meeting rooms and spill into spaces where coworkers expect quiet.", mobileMedia: ["/assets/figma-web/niche/014-da7-a07285-fcd41-c383173327157-b6-f1-e1105-c1.jpg", "/assets/figma-web/niche/015-564-a3449-d61245-ec-a737-b28-e2-b74-f76-b1105-c1.jpg"] },
      { title: "What is the problem?", body: "Hybrid work increased solo video conferences, but offices were not designed for them.", mobileMedia: ["/assets/figma-web/niche/007-image.jpg"] },
      { title: "How might we design a space for solo calls that adapts to organizational needs?", mobileMedia: ["/assets/figma-web/niche/008-image1.jpg"] },
      { eyebrow: "Design criteria", title: "Adaptable, comfortable, intuitive", mobileMedia: ["/assets/figma-web/niche/010-image2.jpg", "/assets/figma-web/niche/012-image3.jpg"] },
      { mobileMedia: ["/assets/figma-web/niche/016-img98392.jpg", "/assets/figma-web/niche/017-img98412.jpg", "/assets/figma-web/niche/018-eeee1.jpg"] },
      { body: "An early-stage scale prototype enabled in-depth testing and led to form refinements.", mobileMedia: ["/assets/figma-web/niche/020-drawing1.jpg"] },
      { mobileMedia: ["/assets/figma-web/niche/021-12.jpg"] },
      { title: "Introducing Niche", body: "A booth designed to fit the shape of your organization.", mobileMedia: ["/assets/figma-web/niche/022-booth-v2-booth-v2-studio120250606111.jpg"] },
      { body: "A space to take calls, get focused work done, or have some privacy.", mobileMedia: ["/assets/figma-web/niche/023-booth-v2-phone-booth-occupied-sayl-tall118202506281.jpg"] },
      { title: "Open, equipped, private", body: "Translucent walls, built-in lighting and a monitor, and layered acoustic materials support solo calls.", mobileMedia: ["/assets/figma-web/niche/024-booth-full-open-door-sayl-tall16202505271.jpg", "/assets/figma-web/niche/025-booth-v2-phone-booth-occupied-interior17202506281.jpg", "/assets/figma-web/niche/026-material-layers1.jpg"] },
      { mobileMedia: ["/assets/figma-web/niche/027-15-video.jpg"] },
      { body: "Modular assembly allows Niche to reconfigure to your needs.", mobileMedia: ["/assets/figma-web/niche/028-cubicle-cubicle-sayl-tall120202507191.jpg"] },
      { body: "Niche can scale to a private workspace.", mobileMedia: ["/assets/figma-web/niche/029-17.jpg"] },
      { body: "Or even just a desk.", mobileMedia: ["/assets/figma-web/niche/030-18.jpg"] },
      { title: "Monolith", body: "Video call booth designed for hybrid workers.", mobileMedia: ["/assets/figma-web/niche/031-3250802-cubicle-sayl-tall11.jpg"] },
      { mobileMedia: ["/assets/figma-web/niche/032-250727-indoor2-booth-full-open-door-sayl-tall11.jpg"] },
    ],
  },
  hyphae: {
    figmaRootId: "3418:211",
    displayTitle: "Hyphae",
    introduction:
      "The Hyphae light is a fixture concept modeled on the microscopic growth patterns of mycelium, introducing the future material to users through form.",
    metaLabel: "Type",
    meta: ["Material research", "Digital modeling", "Prototyping"],
    date: "2023",
    sections: [
      { eyebrow: "Why", title: "Material-driven form", body: "The light tells the story of mycelium by translating its growth into a visible structure.", mobileMedia: ["/assets/figma-web/hyphae/002-hyphaelightflat1.jpg", "/assets/figma-web/hyphae/003-image54.jpg", "/assets/figma-web/hyphae/004-image51.jpg"] },
      { eyebrow: "Background", hideCompositeOnMobile: true },
      { title: "What is mycelium?", body: "Mycelium is the root system beneath mushrooms. Grown through wood chips, it becomes a compostable material between foam and fiberboard.", mobileMedia: ["/assets/figma-web/hyphae/005-os1234567-n37-webimageland-jpg.jpg", "/assets/figma-web/hyphae/006-image50.jpg", "/assets/figma-web/hyphae/007-os1234567-n13-webimageland-jpg.jpg", "/assets/figma-web/hyphae/008-image46.jpg", "/assets/figma-web/hyphae/009-os1234567-n18-webimageport-jpg.jpg"] },
      { title: "Mycelium in the ground", mobileMedia: ["/assets/figma-web/hyphae/005-os1234567-n37-webimageland-jpg.jpg"] },
      { title: "Hyphae under the microscope", mobileMedia: ["/assets/figma-web/hyphae/006-image50.jpg", "/assets/figma-web/hyphae/008-image46.jpg"] },
      { title: "Hyphae, the building blocks of mycelium", body: "Thousands of microscopic searching strands overlap into visible white veins.", mobileMedia: ["/assets/figma-web/hyphae/009-os1234567-n18-webimageport-jpg.jpg"] },
      { eyebrow: "Process", hideCompositeOnMobile: true },
      { title: "Extracting form from nature", body: "A growth simulation revealed the branching lines that became the fixture’s structure.", mobileMedia: ["/assets/figma-web/hyphae/010-scr20240505-pvcg21.jpg"] },
      { body: "Digitally simulated growth of mycelium.", mobileMedia: ["/assets/figma-web/hyphae/010-scr20240505-pvcg21.jpg"] },
      { eyebrow: "Prototype", hideCompositeOnMobile: true },
      { title: "Making the skeleton", body: "The digital model was divided into CNC-cut wooden parts and assembled before growth.", mobileMedia: ["/assets/figma-web/hyphae/011-img8028.jpg", "/assets/figma-web/hyphae/013-img8038.jpg", "/assets/figma-web/hyphae/014-img8044.jpg"] },
      { title: "Growing mycelium", body: "Living composite was packed around the skeleton and left to grow through the structure.", mobileMedia: ["/assets/figma-web/hyphae/012-os1234567-n17-webimageport-jpg.jpg", "/assets/figma-web/hyphae/015-img8124.jpg", "/assets/figma-web/hyphae/016-img8042.jpg"] },
      { body: "After five days, the prototype revealed healthy mycelium growth.", mobileMedia: ["/assets/figma-web/hyphae/013-img8038.jpg", "/assets/figma-web/hyphae/016-img8042.jpg"] },
      { title: "Finishing", body: "Lights were attached to the ends of the hyphae, then the material was dried to stop further growth.", mobileMedia: ["/assets/figma-web/hyphae/017-photo1.jpg", "/assets/figma-web/hyphae/018-os1234567-n14-webimageland-jpg.jpg", "/assets/figma-web/hyphae/019-img81931.jpg"] },
      { title: "Hyphae", body: "A living-material light.", mobileMedia: ["/assets/figma-web/hyphae/021-hyphaelight-hero1.jpg"] },
      { mobileMedia: ["/assets/figma-web/hyphae/021-hyphaelight-hero1.jpg"] },
      { body: "The sculpture accurately represents microscopic growth, with each limb splitting where actual mycelium would split.", mobileMedia: ["/assets/figma-web/hyphae/020-dsc6373.jpg"] },
      { mobileMedia: ["/assets/figma-web/hyphae/022-dsc63851.jpg"] },
      { mobileMedia: ["/assets/figma-web/hyphae/001-dsc6387.jpg"] },
      { eyebrow: "Next steps", body: "Further iterations would focus on production methods and a more realistic material finish.", mobileMedia: ["/assets/figma-web/hyphae/022-dsc63851.jpg"] },
      {},
      {},
      {},
      {},
    ],
  },
  ping: {
    figmaRootId: "13077:866",
    displayTitle: "Ping",
    introduction:
      "Kids communication device. Developed in Spring 2025 at MIT by a seven-person team of MBAs, engineers, and a UI/UX designer, where I led industrial design.",
    metaLabel: "Role",
    meta: ["Concept Development", "User Research", "User Testing", "Industrial Design"],
    date: "2025",
    sections: [
      { body: "Families stay connected with Ping.", mobileMedia: ["/assets/figma-web/ping/002-251204-watch-backplate2.jpg", "/assets/figma-web/ping/003-251225-hangtag-on-jacket2.jpg", "/assets/figma-web/ping/005-watch21-pixl251214-tag-angle1.jpg", "/assets/figma-web/ping/006-251024-front2251224-watch-front1.jpg", "/assets/figma-web/ping/007-251024-hangatge251224-hangtag-angle1.jpg"] },
      { body: "Ping lets kids and families exchange voice messages and share location without open internet access.", mobileMedia: ["/assets/figma-web/ping/001-251202-hero-hand1.jpg"] },
      { body: "Its design eliminates notification buzzes and internet access that can easily distract kids.", mobileMedia: ["/assets/figma-web/ping/009-frontt251215-ping-front1.jpg", "/assets/figma-web/ping/015-251024-front2251224-gumshell1.jpg"] },
      { title: "A dedicated channel", body: "The parent’s phone and the child’s Ping stay connected without unknown calls or distracting messages.", mobileMedia: ["/assets/figma-web/ping/004-image-mesh-gradient11.jpg"] },
      { title: "Ping functionality", body: "Voice messages, location sharing, and a dedicated emergency control keep essential communication clear." },
      { body: "The companion app leads with plain language; detail appears only when you ask for it.", mobileMedia: ["/assets/figma-web/ping/017-iphone16-pro.jpg", "/assets/figma-web/ping/021-image241.jpg"] },
      { title: "App functionality", body: "Messaging, location, and emergency details stay organized for parents.", mobileMedia: ["/assets/figma-web/ping/017-iphone16-pro.jpg", "/assets/figma-web/ping/021-image241.jpg"] },
      { body: "Kids can wear Ping in different colors, cases, and collaborations that let them express themselves.", mobileMedia: ["/assets/figma-web/ping/008-2512071.jpg"] },
      { eyebrow: "Inside Ping", body: "Display, circuit board, emergency button, and navigation controls fit into a focused device.", mobileMedia: ["/assets/figma-web/ping/022-exploded2512191.jpg", "/assets/figma-web/ping/023-251221-charging1.jpg"] },
      { body: "Technology helps families stay connected, but the devices kids use are often loaded with distractions.", mobileMedia: ["/assets/figma-web/ping/024-image87.jpg", "/assets/figma-web/ping/025-image212.jpg", "/assets/figma-web/ping/026-image251.jpg", "/assets/figma-web/ping/027-image252.jpg"] },
      { title: "What drives families to give kids mobile devices?", body: "The need for safety and emergency contact often outweighs concerns about distraction.", mobileMedia: ["/assets/figma-web/ping/028-image91.jpg"] },
      { title: "Current options trade capability for distraction and control.", mobileMedia: ["/assets/figma-web/ping/010-image.jpg", "/assets/figma-web/ping/013-image1.jpg"] },
      { title: "How might we keep families connected while keeping the distractions of technology and the internet out?", mobileMedia: ["/assets/figma-web/ping/004-image-mesh-gradient11.jpg"] },
      { mobileMedia: ["/assets/figma-web/ping/001-251202-hero-hand1.jpg"] },
      { mobileMedia: ["/assets/figma-web/ping/009-frontt251215-ping-front1.jpg"] },
    ],
  },
  mode: {
    figmaRootId: "4879:761",
    displayTitle: "Mode",
    introduction:
      "Mode is a bedside table designed for the routines of modern life. Three distinct layers allow users to segment needs based on frequency of use and visibility.",
    metaLabel: "Type",
    meta: ["Research", "Making"],
    date: "2023",
    sections: [
      {
        body: "Modern beds have evolved into multifunctional hubs where people spend extended time on activities beyond sleep.",
        mobileMedia: [
          "/assets/figma-web/mode/002-image62.jpg",
          "/assets/figma-web/mode/003-image63.jpg",
          "/assets/figma-web/mode/004-image64.jpg",
          "/assets/figma-web/mode/005-image65.jpg",
        ],
      },
      {
        title: "How might we create bedside tables with the functional versatility to meet varied modern needs?",
        mobileMedia: ["/assets/figma-web/mode/006-image.jpg"],
      },
      { eyebrow: "Design process", hideCompositeOnMobile: true },
      {
        eyebrow: "Design criteria",
        title: "Functional, tasteful, intuitive",
        mobileMedia: [
          "/assets/figma-web/mode/007-image1.jpg",
          "/assets/figma-web/mode/009-image2.jpg",
          "/assets/figma-web/mode/011-image3.jpg",
        ],
      },
      { mobileMedia: ["/assets/figma-web/mode/013-img05551.jpg"] },
      { eyebrow: "Making", hideCompositeOnMobile: true },
      {
        body: "The rectangular box was built first as the backbone of the piece.",
        mobileMedia: ["/assets/figma-web/mode/015-img67181.jpg"],
      },
      {
        body: "Laser-cut templates guided a router to cut the legs repeatedly and accurately.",
        mobileMedia: [
          "/assets/figma-web/mode/016-img66791.jpg",
          "/assets/figma-web/mode/017-img66991.jpg",
        ],
      },
      { mobileMedia: ["/assets/figma-web/mode/019-img67261.jpg"] },
      { eyebrow: "Design", hideCompositeOnMobile: true },
      { mobileMedia: ["/assets/figma-web/mode/021-665-fb92-ad4-fed8-da46-bf0271-dsc55501.jpg"] },
      {
        body: "Mode’s mid-century look fits into nearly any home.",
        mobileMedia: ["/assets/figma-web/mode/023-be21.jpg"],
      },
      {
        body: "A large surface lets you keep whatever you need ready to go.",
        mobileMedia: ["/assets/figma-web/mode/024-be31.jpg"],
      },
      {
        body: "An open shelf keeps frequently used items accessible, while an enclosed shelf hides long-term clutter.",
        mobileMedia: [
          "/assets/figma-web/mode/025-be41.jpg",
          "/assets/figma-web/mode/026-be51.jpg",
        ],
      },
      {
        body: "Always-open shelves reveal every item from afar, encouraging users to decide where clutter should permanently live.",
        mobileMedia: ["/assets/figma-web/mode/027-be61.jpg"],
      },
    ],
  },
};

export function getProjectNarrative(slug: ProjectSlug) {
  return projectNarratives[slug];
}
