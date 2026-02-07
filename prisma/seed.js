import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const relativePart = process.env.DATABASE_URL.replace('file:./', '');
  const absolutePath = path.resolve(projectRoot, relativePart);
  process.env.DATABASE_URL = `file:${absolutePath}`;
}

const prisma = new PrismaClient();

function entry(collection, slug, data, { title, position = 0, status = 'published' } = {}) {
  return {
    collection,
    slug,
    title: title ?? data.title ?? null,
    data: JSON.stringify(data),
    status,
    position,
    publishedAt: status === 'published' ? new Date() : null,
  };
}

async function upsertEntries(entries) {
  for (const item of entries) {
    await prisma.contentEntry.upsert({
      where: {
        collection_slug: {
          collection: item.collection,
          slug: item.slug,
        },
      },
      update: {
        title: item.title,
        data: item.data,
        status: item.status,
        position: item.position,
        publishedAt: item.publishedAt,
      },
      create: item,
    });
  }
}

async function main() {
  const adminEmail = 'admin@polyjoule.fr';
  const adminPassword = 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrateur Polyjoule',
      passwordHash,
      role: 'admin',
    },
  });

  const heroData = [
    entry('home-hero', 'principal', {
      badge: 'Innovation énergétique & mobilité durable',
      title: 'Polyjoule',
      lead:
        "L’association Polyjoule rassemble des étudiantes et étudiants passionnés qui imaginent, conçoivent et testent des véhicules sobres en énergie pour relever les défis de la mobilité de demain.",
      primaryCtaLabel: "Découvrir l’association",
      primaryCtaHref: '/presentation',
      secondaryCtaLabel: 'Nos événements',
      secondaryCtaHref: '/calendrier',
      illustrationPath: '/assets/header.png',
    }),
  ];

  const quickLinks = [
    entry(
      'quick-links',
      'historique',
      {
        icon: 'ri-timer-flash-line',
        title: 'Historique',
        description: 'Revivez près de vingt ans d’exploits et de records.',
        href: '/historique',
      },
      { position: 1 }
    ),
    entry(
      'quick-links',
      'palmares',
      {
        icon: 'ri-trophy-line',
        title: 'Palmarès',
        description: 'Parcourez les performances marquantes de nos équipes.',
        href: '/palmares',
      },
      { position: 2 }
    ),
    entry(
      'quick-links',
      'vehicules',
      {
        icon: 'ri-roadster-line',
        title: 'Véhicules',
        description: 'Découvrez les prototypes et Urban Concepts Polyjoule.',
        href: '/infos-vehicule',
      },
      { position: 3 }
    ),
    entry(
      'quick-links',
      'galerie',
      {
        icon: 'ri-gallery-line',
        title: 'Galerie',
        description: "Plongez dans les coulisses de l’association en images.",
        href: '/gallery',
      },
      { position: 4 }
    ),
  ];

  const partners = [
    entry(
      'partners',
      'polytech-nantes',
      {
        name: 'Polytech Nantes',
        url: 'https://www.polytech-nantes.fr/',
        logoPath: '/assets/POLYTECH-NANTES.png',
      },
      { position: 1 }
    ),
    entry(
      'partners',
      'la-joliverie',
      {
        name: 'La Joliverie',
        url: 'https://www.la-joliverie.com/',
        logoPath: '/assets/logo_joliverie_hd_rvb_j.png',
      },
      { position: 2 }
    ),
    entry(
      'partners',
      'abalone',
      {
        name: 'Abalone',
        url: 'https://www.abalone-emploi.com/',
        logoPath: '/assets/Logo_Abalone_Group_2019_contour.png',
      },
      { position: 3 }
    ),
    entry(
      'partners',
      'ten',
      {
        name: 'T.EN',
        url: 'https://www.ten.com/fr',
        logoPath: '/assets/logo.webp',
      },
      { position: 4 }
    ),
    entry(
      'partners',
      'pole-sciences',
      {
        name: 'Pôle Sciences & Technologie',
        url: '',
        logoPath: '/assets/logo-pole_sciences-technologie-noir.png',
      },
      { position: 5 }
    ),
  ];

  const palmares = [
    {
      year: '2022',
      title: '7051 km/LEE à l’Eco Green Gas',
      description:
        'Retour gagnant sur piste : le prototype électrique atteint une performance record à Fay-de-Bretagne.',
    },
    {
      year: '2019',
      title: 'Record Cityjoule : 2853 km/LEE',
      description:
        'Performance Urban Concept électrique sur le site Toyota France lors de l’EducEco Onnaing.',
    },
    {
      year: '2016',
      title: 'Double victoire hydrogène',
      description:
        'Cityjoule s’impose à l’EducEco de Valenciennes et au Shell Eco Marathon de Londres.',
    },
    {
      year: '2015',
      title: '12 788 km/LEE en solaire',
      description:
        'Cityjoule bat le record du monde Urban Concept solaire à l’EducEco de Colomiers.',
    },
    {
      year: '2014',
      title: '6329 km/LEE en hydrogène',
      description:
        'Le prototype Polyjoule pulvérise le record mondial lors de l’EducEco.',
    },
    {
      year: '2013',
      title: 'Cityjoule dévoilé',
      description:
        'Inauguration du véhicule Urban Concept et double record pour sa première saison de compétition.',
    },
    {
      year: '2012',
      title: '10 017 km/LEE électrique',
      description:
        'Record mondial du prototype Polyjoule à l’EducEco de Nogaro.',
    },
    {
      year: '2010',
      title: 'Victoire au Shell Eco Marathon',
      description:
        'Polyjoule remporte la catégorie hydrogène à Lausitz avec 4872 km/LEE.',
    },
  ].map((item, index) => entry('palmares', item.year, item, { position: index + 1, title: item.title }));

  const timelineData = [
    {
      year: '2022',
      title: 'Retour sur la piste',
      description:
        'Participation à la 1ère édition de l’Eco Green Gas sur le circuit de Fay-de-Bretagne avec 7051 km/LEE* en électrique.',
      imagePath: '/assets/historique-photos/2022.jpeg',
      imageAlt: 'Equipe Polyjoule 2022',
    },
    {
      year: '2020-2021',
      title: 'Pause sanitaire',
      description:
        "Les compétitions sont suspendues en raison de la pandémie de COVID-19, ralentissant l’activité associative.",
      imagePath: '/assets/historique-photos/2021.JPG',
      imageAlt: 'Equipe Polyjoule 2021',
    },
    {
      year: '2019',
      title: 'Record à Onnaing',
      description:
        'Cityjoule établit un record Urban Concept électrique à l’EducEco Onnaing avec 2853 km/LEE*.',
      imagePath: '/assets/historique-photos/2019_2.JPG',
      imageAlt: 'Cityjoule 2019',
    },
    {
      year: '2018',
      title: 'Apprentissage sur la PAC',
      description:
        'Année d’apprentissage : la pile à combustible révèle des défauts majeurs, révélant un axe stratégique.',
      imagePath: '/assets/historique-photos/2018_2.JPG',
      imageAlt: 'Polyjoule 2018',
    },
    {
      year: '2017',
      title: 'Pile à combustible maison',
      description:
        'Début du développement interne de la PAC. Cityjoule signe une 1re place à l’EducEco et une 2e place au SEM à Londres.',
      imagePath: '/assets/historique-photos/2019.JPG',
      imageAlt: 'Equipe Polyjoule 2017',
    },
    {
      year: '2016',
      title: 'Supercapacités',
      description:
        'Premiers tests de supercapacités sur Cityjoule et doublé victorieux à Valenciennes et Londres en hydrogène.',
      imagePath: '/assets/historique-photos/2016.JPG',
      imageAlt: 'Cityjoule 2016',
    },
    {
      year: '2015',
      title: 'Record solaire',
      description:
        'Cityjoule bat le record du monde Urban Concept solaire (12 788 km/LEE*) et Polyjoule remporte la catégorie hydrogène.',
      imagePath: '/assets/historique-photos/11248805_848377648577584_5173332569536556933_o.jpg',
      imageAlt: 'Equipe Polyjoule 2015',
    },
    {
      year: '2014',
      title: 'Record hydrogène',
      description:
        'Polyjoule franchit 6329 km/LEE* en hydrogène à l’EducEco et Cityjoule améliore son record à Rotterdam.',
      imagePath: '/assets/historique-photos/IMG_0249.JPG',
      imageAlt: 'Polyjoule 2014',
    },
    {
      year: '2013',
      title: 'Inauguration de Cityjoule',
      description:
        'Cityjoule est inauguré au Conseil Régional des Pays de la Loire et bat déjà des records.',
      imagePath: '/assets/historique-photos/2013.jpg',
      imageAlt: 'Cityjoule 2013',
    },
    {
      year: '2012',
      title: 'Exploit électrique',
      description:
        'Record mondial de 10 017 km/LEE* en prototype électrique et victoire hydrogène au SEM.',
      imagePath: '/assets/historique-photos/2012.PNG',
      imageAlt: 'Prototype Polyjoule 2012',
    },
    {
      year: '2011',
      title: 'Lancement Cityjoule',
      description:
        'Lancement du projet Cityjoule et nouveau record hydrogène au SEM de Lausitz (5130 km/LEE*).',
      imagePath: '/assets/historique-photos/2011.PNG',
      imageAlt: 'Polyjoule 2011',
    },
    {
      year: '2010',
      title: 'Victoire à Lausitz',
      description:
        'Première place au Shell Eco Marathon de Lausitz et record hydrogène avec 4872 km/LEE*.',
      imagePath: '/assets/historique-photos/2010.png',
      imageAlt: 'Polyjoule 2010',
    },
    {
      year: '2009',
      title: 'Seconde place au SEM',
      description:
        'Polyjoule dépasse les 3000 km/LEE* et monte sur le podium hydrogène à Lausitz.',
      imagePath: '/assets/historique-photos/2009.jpg',
      imageAlt: 'Prototype 2009',
    },
    {
      year: '2008',
      title: 'Nogaro',
      description: 'Deuxième place hydrogène au SEM de Nogaro avec 2830 km/LEE*.',
      imagePath: '/assets/historique-photos/2008.PNG',
      imageAlt: 'Prototype 2008',
    },
    {
      year: '2007',
      title: 'Première victoire',
      description: 'Première victoire hydrogène au Shell Eco Marathon de Nogaro (2797 km/LEE*).',
      imagePath: '/assets/historique-photos/2007.PNG',
      imageAlt: 'Equipe 2007',
    },
    {
      year: '2006',
      title: 'Premiers pas',
      description: 'Première participation au Shell Eco Marathon de Nogaro : 2e place en hydrogène.',
      imagePath: '/assets/historique-photos/2006.png',
      imageAlt: 'Prototype 2006',
    },
    {
      year: '2005',
      title: 'Naissance de Polyjoule',
      description: "Création de l’association Polyjoule entre Polytech Nantes et La Joliverie.",
      imagePath: '/assets/historique-photos/2005.jpg',
      imageAlt: 'Création Polyjoule',
    },
  ].map((item, index) => entry('timeline', item.year, item, { position: index + 1, title: item.title }));

  const upcomingEvents = [
    entry(
      'events-upcoming',
      'afterwork-koko',
      {
        title: 'Afterwork au KOKO',
        summary:
          'Rendez-vous le lundi 30 septembre au KOKO pour un afterwork partagé avec nos partenaires.',
        date: '30 septembre',
        ctaLabel: 'Plus de détails',
        ctaHref: '/calendrier/afterwork-koko',
        imagePath: '/calendrier/event-1.jpg',
      },
      { position: 1 }
    ),
    entry(
      'events-upcoming',
      'challenge-ecogreen-energy',
      {
        title: 'Challenge EcoGreen Energy',
        summary:
          'Première course de la saison : lancement des derniers réglages avant le Shell Eco-marathon.',
        date: 'Prochainement',
        ctaLabel: 'Plus de détails',
        ctaHref: '/calendrier/challenge-ecogreen-energy',
        imagePath: '/calendrier/event-2.jpg',
      },
      { position: 2 }
    ),
    entry(
      'events-upcoming',
      'tournoi-mario-kart',
      {
        title: 'Tournoi Mario Kart',
        summary:
          'Jeudi à la Cahute : une soirée conviviale pour fédérer pilotes et supporters.',
        date: 'Jeudi',
        ctaLabel: 'Plus de détails',
        ctaHref: '/calendrier/tournoi-mario-kart',
        imagePath: '/calendrier/event-3.jpg',
      },
      { position: 3 }
    ),
  ];

  const pastEvents = [
    entry(
      'events-past',
      'hyvolution',
      {
        title: 'Hyvolution',
        summary:
          'Salon de référence dédié à l’hydrogène où Polyjoule a présenté ses innovations.',
        date: 'Février 2024',
        ctaLabel: 'Voir le récapitulatif',
        ctaHref: '/calendrier/hyvolution',
        imagePath: '/calendrier/event-4.png',
      },
      { position: 1 }
    ),
    entry(
      'events-past',
      'shell-eco-marathon-2024',
      {
        title: 'Shell Eco-marathon 2024',
        summary: 'Les contrôles techniques sont validés, place aux essais !',
        date: 'Mai 2024',
        ctaLabel: 'Voir le récapitulatif',
        ctaHref: '/calendrier/shell-eco-marathon-2024',
        imagePath: '/calendrier/event-5.jpg',
      },
      { position: 2 }
    ),
    entry(
      'events-past',
      'assemblee-generale-2024',
      {
        title: 'Assemblée Générale 2024',
        summary:
          'Bilan de la saison et lancement du nouveau bureau avec nos partenaires.',
        date: '16 octobre 2024',
        ctaLabel: 'Voir le récapitulatif',
        ctaHref: '/calendrier/assemblee-generale-2024',
        imagePath: '/calendrier/event-6.jpg',
      },
      { position: 3 }
    ),
  ];

  const eventDetails = [
    {
      slug: 'afterwork-koko',
      title: 'Afterwork au KOKO',
      intro:
        "Partagez un moment convivial avec Polyjoule et Nantes Space Systems autour d'un verre le lundi 30 septembre au KOKO.",
      bodyHtml:
        '<p>Ce sera l’occasion idéale de relâcher la pression des cours, d’échanger avec les membres des associations et de rencontrer de nouveaux talents. Venez nombreux !</p>',
      imagePath: '/calendrier/event-1.jpg',
    },
    {
      slug: 'challenge-ecogreen-energy',
      title: 'Challenge EcoGreen Energy',
      intro:
        'Première course de la saison pour lancer les derniers réglages avant le Shell Eco-marathon.',
      bodyHtml:
        '<p>Suivez les coulisses de l’équipe sur nos réseaux et découvrez l’affiche réalisée par notre partenaire @k0ureur. Une entrée en matière idéale pour tester nos évolutions techniques.</p>',
      imagePath: '/calendrier/event-2.jpg',
    },
    {
      slug: 'tournoi-mario-kart',
      title: 'Tournoi Mario Kart',
      intro: 'La Cahute ouvre ses portes pour un après-midi de défis sur Mario Kart.',
      bodyHtml:
        "<p>Venez vous défier et tentez de décrocher la première place sur la piste virtuelle ! Ambiance garantie pour les membres et les supporters.</p>",
      imagePath: '/calendrier/event-3.jpg',
    },
    {
      slug: 'hyvolution',
      title: 'Hyvolution',
      intro: "Hyvolution, c’est l’événement de référence pour l’hydrogène.",
      bodyHtml:
        '<p>Nous avons échangé avec des experts, assisté à des conférences, découvert les dernières innovations et exploré de nouvelles opportunités de partenariat. Un moment clé pour nos ambitions en matière de mobilité durable.</p>',
      imagePath: '/calendrier/event-4.png',
    },
    {
      slug: 'shell-eco-marathon-2024',
      title: 'Shell Eco-marathon 2024',
      intro: 'Objectif atteint : contrôles techniques validés pour nos deux véhicules.',
      bodyHtml:
        '<p>Le travail conjoint de Polyjoule et de La Joliverie porte ses fruits : les voitures sont prêtes à rouler au Shell Eco Marathon 2024. Les essais peuvent commencer !</p>',
      imagePath: '/calendrier/event-5_2.jpeg',
    },
    {
      slug: 'assemblee-generale-2024',
      title: 'Assemblée Générale 2024',
      intro: 'Un moment important pour faire le bilan de l’année écoulée et lancer la nouvelle saison.',
      bodyHtml:
        '<p>Merci à Polytech Nantes, La Joliverie ainsi qu’à nos partenaires Abalone, RS, T.EN, BETA Vêtements et Siemens pour leur soutien indispensable. Ensemble vers de nouveaux défis !</p>',
      imagePath: '/calendrier/event-6.jpg',
    },
  ].map((item, index) =>
    entry(
      'event-detail',
      item.slug,
      {
        title: item.title,
        intro: item.intro,
        bodyHtml: item.bodyHtml,
        imagePath: item.imagePath,
      },
      { position: index + 1, title: item.title }
    )
  );

  const gallerySlides = [
    entry(
      'gallery-slides',
      'vehicule-1',
      { imagePath: '/assets/vehicule1.jpg', altText: 'Prototype Polyjoule' },
      { position: 1 }
    ),
    entry(
      'gallery-slides',
      'vehicule-2',
      { imagePath: '/assets/vehicule2.JPG', altText: 'Equipe Polyjoule' },
      { position: 2 }
    ),
    entry(
      'gallery-slides',
      'vehicule-3',
      { imagePath: '/assets/vehicule3.JPG', altText: 'Préparation mécanique' },
      { position: 3 }
    ),
    entry(
      'gallery-slides',
      'vehicule-4',
      { imagePath: '/assets/vehicule4.JPG', altText: 'Cityjoule sur piste' },
      { position: 4 }
    ),
  ];

  const vehicles = [
    entry(
      'vehicles',
      'cityjoule',
      {
        category: 'Urban Concept',
        title: 'Cityjoule',
        intro:
          "Conçu pour se rapprocher d’un véhicule du quotidien, l’Urban Concept possède quatre roues, un poste de conduite assis et un éclairage complet.",
        bodyHtml:
          "<p>Objectif : transporter une personne de 70 kg à environ 30 km/h avec une consommation minimale. Inauguré en 2013, Cityjoule est le fruit de trois ans de développement et de la mobilisation de plus de 400 élèves. Depuis, il accumule victoires et records en électrique comme en hydrogène.</p>",
        imagePath: '/assets/vehicule1.jpg',
        galleryPaths: ['/assets/vehicule2.JPG', '/assets/vehicule3.JPG', '/assets/vehicule4.JPG'],
      },
      { position: 1, title: 'Cityjoule' }
    ),
    entry(
      'vehicles',
      'polyjoule',
      {
        category: 'Prototype',
        title: 'Polyjoule',
        intro:
          'Le prototype électrique Polyjoule concourt dans la catégorie la plus ouverte des compétitions énergétiques.',
        bodyHtml:
          "<p>Né en 2005, chaque composant est optimisé pour gagner en légèreté et en sobriété énergétique. L’optimisation poussée permet aujourd’hui d’atteindre un poids inférieur à 27 kg et d’enchaîner les records d’autonomie.</p>",
        imagePath: '/assets/Copie de IMG_2871.jpg',
        galleryPaths: [],
      },
      { position: 2, title: 'Polyjoule' }
    ),
  ];

  const presentation = [
    entry(
      'page-presentation',
      'association',
      {
        title: "Présentation de l’association",
        intro: "Polyjoule réunit des étudiants passionnés de Polytech Nantes et de La Joliverie autour d'un objectif commun : concevoir les véhicules de demain.",
        bodyHtml: `
        <p>L'association Polyjoule est née en 2005 de la volonté de faire collaborer des étudiants d'horizons différents autour d'un projet technologique d'envergure. Depuis, chaque année, une quarantaine d'élèves ingénieurs et de lycéens unissent leurs compétences pour concevoir, fabriquer et optimiser des véhicules à très haute efficacité énergétique.</p>
        <p>Notre philosophie repose sur le partage de connaissances : les étudiants de Polytech apportent leur expertise en gestion de projet, électronique et simulation, tandis que les élèves de La Joliverie excellent dans la conception mécanique et la fabrication. Ensemble, ils relèvent le défi du Shell Eco-marathon, compétition internationale où le but est de parcourir la plus grande distance possible avec l'équivalent d'un litre de carburant.</p>
        <p>Au-delà de la performance technique, Polyjoule est une aventure humaine formatrice, où l'esprit d'équipe, la rigueur et l'innovation sont les clés du succès.</p>
        `,
        values: [
          {
            icon: 'ri-lightbulb-flash-line',
            title: 'Innovation',
            description:
              "Nous explorons de nouvelles technologies, de l'hydrogène aux supercondensateurs, pour repousser les limites de l'efficacité.",
          },
          {
            icon: 'ri-graduation-cap-line',
            title: 'Pédagogie',
            description:
              "Un projet étudiant avant tout, permettant d'appliquer concrètement les connaissances théoriques dans un cadre professionnel.",
          },
          {
            icon: 'ri-team-line',
            title: 'Partenariat',
            description:
              "Une collaboration unique et historique entre une école d'ingénieurs (Polytech) et un lycée technique (La Joliverie).",
          },
        ],
        stats: {
          years: '20+',
          students: '400+',
        },
      },
      { title: "Présentation de l’association" }
    ),
  ];

  await upsertEntries([
    ...heroData,
    ...quickLinks,
    ...partners,
    ...palmares,
    ...timelineData,
    ...upcomingEvents,
    ...pastEvents,
    ...eventDetails,
    ...gallerySlides,
    ...vehicles,
    ...presentation,
  ]);

  console.log('Seed terminé. Identifiants admin :');
  console.log(`  Email       : ${adminEmail}`);
  console.log(`  Mot de passe: ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
