// ─── Names — the single source of every random person's name in the game ──
// Every crew member and every other responding unit's personnel (see
// fleet.js's `person()`/`drawPersonName()`) draws from this pool. Moved out
// of fleet.js so the name list can grow on its own without touching
// crew-generation logic — add a name here and it's immediately in rotation.
//
// Each entry is tagged with the gender the name conventionally reads as, so
// a drawn name and the pronouns used for that person are never at odds
// (fleet.js derives `pronouns` from this tag via `pronounForGender`, rather
// than picking a pronoun independently of the name). A "nonbinary" tag
// resolves to "they" — used on names that are genuinely androgynous rather
// than assigned to make up a quota.
//
// `drawName()` drains the pool without replacement (so a single shift never
// repeats a name) and reshuffles once it's exhausted.
export const NAME_POOL=[
  {name:"Liam Smith",gender:"male"},{name:"Olivia Johnson",gender:"female"},
  {name:"Noah Williams",gender:"male"},{name:"Emma Brown",gender:"female"},
  {name:"Ethan Jones",gender:"male"},{name:"Sophia Garcia",gender:"female"},
  {name:"Mateo Rodríguez",gender:"male"},{name:"Isabella Martínez",gender:"female"},
  {name:"Arjun Patel",gender:"male"},{name:"Ananya Sharma",gender:"female"},
  {name:"Wei Chen",gender:"male"},{name:"Mei Lin",gender:"female"},
  {name:"Hiro Tanaka",gender:"male"},{name:"Yui Sato",gender:"female"},
  {name:"Min-jun Kim",gender:"male"},{name:"Ji-eun Park",gender:"female"},
  {name:"Ahmed Hassan",gender:"male"},{name:"Amina El-Sayed",gender:"female"},
  {name:"Omar Khalil",gender:"male"},{name:"Fatima Rahman",gender:"female"},
  {name:"Ibrahim Okafor",gender:"male"},{name:"Adaeze Nwosu",gender:"female"},
  {name:"Kwame Mensah",gender:"male"},{name:"Ama Boateng",gender:"female"},
  {name:"Jean Dupont",gender:"male"},{name:"Claire Moreau",gender:"female"},
  {name:"Luca Rossi",gender:"male"},{name:"Giulia Bianchi",gender:"female"},
  {name:"Carlos Silva",gender:"male"},{name:"Beatriz Costa",gender:"female"},
  {name:"Ivan Petrov",gender:"male"},{name:"Anastasia Ivanova",gender:"female"},
  {name:"Jakub Nowak",gender:"male"},{name:"Zofia Kowalska",gender:"female"},
  {name:"Erik Andersen",gender:"male"},{name:"Freja Nielsen",gender:"female"},
  {name:"Seán Murphy",gender:"male"},{name:"Aoife O'Sullivan",gender:"female"},
  {name:"Yusuf Demir",gender:"male"},{name:"Elif Yılmaz",gender:"female"},
  {name:"Daniel Cohen",gender:"male"},{name:"Yael Levi",gender:"female"},
  {name:"Gabriel Popescu",gender:"male"},{name:"Elena Ionescu",gender:"female"},
  {name:"Andrei Novak",gender:"male"},{name:"Petra Horváth",gender:"female"},
  {name:"Milan Kovač",gender:"male"},{name:"Katarina Jovanović",gender:"female"},
  {name:"Nikola Stojanov",gender:"male"},{name:"Milica Petrović",gender:"female"},
  {name:"Thomas Müller",gender:"male"},{name:"Anna Schneider",gender:"female"},
  {name:"Victor Dumitrescu",gender:"male"},{name:"Ioana Georgescu",gender:"female"},
  {name:"Diego Fernández",gender:"male"},{name:"Camila Morales",gender:"female"},
  {name:"Javier Ortega",gender:"male"},{name:"Valeria Castillo",gender:"female"},
  {name:"Samuel Baker",gender:"male"},{name:"Grace Turner",gender:"female"},
  {name:"Benjamin Clark",gender:"male"},{name:"Chloe Evans",gender:"female"},
  {name:"Alexander Reed",gender:"male"},{name:"Lily Cooper",gender:"female"},
  {name:"Michael Hughes",gender:"male"},{name:"Hannah Foster",gender:"female"},
  {name:"Nathan Brooks",gender:"male"},{name:"Zoe Carter",gender:"female"},
  {name:"Ryan Mitchell",gender:"male"},{name:"Ava Collins",gender:"female"},
  {name:"Jacob Bailey",gender:"male"},{name:"Mia Richardson",gender:"female"},
  {name:"David Price",gender:"male"},{name:"Ella Morgan",gender:"female"},
  {name:"Joseph Ward",gender:"male"},{name:"Ruby Bennett",gender:"female"},
  {name:"Adam Cox",gender:"male"},{name:"Lucy Gray",gender:"female"},
  {name:"Christopher Bell",gender:"male"},{name:"Charlotte Perry",gender:"female"},
  {name:"Jonathan Wood",gender:"male"},{name:"Amelia Hughes",gender:"female"},
  {name:"Patrick Kelly",gender:"male"},{name:"Niamh Byrne",gender:"female"},
  {name:"George White",gender:"male"},{name:"Emily Scott",gender:"female"},
  {name:"Marcus Hill",gender:"male"},{name:"Sarah Green",gender:"female"},
  {name:"Dominic Lewis",gender:"male"},{name:"Victoria Adams",gender:"female"},
  {name:"Felix Weber",gender:"male"},{name:"Sofia Lindberg",gender:"female"},
  {name:"Pavel Novák",gender:"male"},{name:"Eva Dvořáková",gender:"female"},
  {name:"Rafael Almeida",gender:"male"},{name:"Mariana Souza",gender:"female"},
  {name:"Kenji Nakamura",gender:"male"},{name:"Haruka Fujimoto",gender:"female"},
  {name:"Tenzin Dorje",gender:"male"},{name:"Pema Lhamo",gender:"female"},
  {name:"Ash Nguyen",gender:"nonbinary"},{name:"Thinh Le",gender:"male"},
  {name:"Athena Tran",gender:"female"},
  // Added on request:
  {name:"Thomas Tran",gender:"male"},{name:"Tiffany Nguyen",gender:"female"},
  {name:"Mason Taylor",gender:"male"},{name:"Harper Moore",gender:"nonbinary"},
  {name:"Logan Anderson",gender:"nonbinary"},{name:"Abigail Thomas",gender:"female"},
  {name:"Lucas Jackson",gender:"male"},{name:"Evelyn Martin",gender:"female"},
  {name:"Henry Lee",gender:"male"},{name:"Scarlett Walker",gender:"female"},
  {name:"Jack Harris",gender:"male"},{name:"Aria Hall",gender:"female"},
  {name:"Levi Allen",gender:"male"},{name:"Layla Young",gender:"female"},
  {name:"Wyatt King",gender:"male"},{name:"Nora Wright",gender:"female"},
  {name:"Owen Scott",gender:"male"},{name:"Hazel Torres",gender:"female"},
  {name:"Julian Rivera",gender:"male"},{name:"Penelope Flores",gender:"female"},
  {name:"Isaac Campbell",gender:"male"},{name:"Stella Mitchell",gender:"female"},
  {name:"Leo Perez",gender:"male"},{name:"Aurora Roberts",gender:"female"},
  {name:"Sebastian Phillips",gender:"male"},{name:"Violet Turner",gender:"female"},
  {name:"Theodore Parker",gender:"male"},{name:"Paisley Edwards",gender:"female"},
  {name:"Hudson Collins",gender:"male"},{name:"Savannah Stewart",gender:"female"},
  {name:"Grayson Morris",gender:"male"},{name:"Claire Rogers",gender:"female"},
  {name:"Aiden Cook",gender:"male"},{name:"Natalie Murphy",gender:"female"},
  {name:"Lincoln Bailey",gender:"male"},{name:"Audrey Reed",gender:"female"},
  {name:"Ezra Bennett",gender:"male"},{name:"Caroline Brooks",gender:"female"},
  {name:"Elijah Ross",gender:"male"},{name:"Alice Henderson",gender:"female"},
  {name:"Juliette Bernard",gender:"female"},{name:"Antoine Laurent",gender:"male"},
  {name:"Mathis Dubois",gender:"male"},{name:"Sophie Lambert",gender:"female"},
  {name:"Marco Esposito",gender:"male"},{name:"Francesca Romano",gender:"female"},
  {name:"Alessandro Conti",gender:"male"},{name:"Chiara Greco",gender:"female"},
  {name:"Miguel Herrera",gender:"male"},{name:"Lucía Navarro",gender:"female"},
  {name:"Alejandro Ruiz",gender:"male"},{name:"Paula Sánchez",gender:"female"},
  {name:"João Pereira",gender:"male"},{name:"Inês Ferreira",gender:"female"},
  {name:"Tiago Carvalho",gender:"male"},{name:"Mafalda Rocha",gender:"female"},
  {name:"Viktor Smirnov",gender:"male"},{name:"Svetlana Kuznetsova",gender:"female"},
  {name:"Mikhail Volkov",gender:"male"},{name:"Ekaterina Sokolova",gender:"female"},
  {name:"Oleksandr Shevchenko",gender:"male"},{name:"Olena Bondarenko",gender:"female"},
  {name:"László Nagy",gender:"male"},{name:"Eszter Tóth",gender:"female"},
  {name:"Marek Wiśniewski",gender:"male"},{name:"Agnieszka Zielińska",gender:"female"},
  {name:"Ondřej Svoboda",gender:"male"},{name:"Tereza Procházková",gender:"female"},
  {name:"Lars Johansen",gender:"male"},{name:"Ingrid Solberg",gender:"female"},
  {name:"Mikkel Kristensen",gender:"male"},{name:"Astrid Olsen",gender:"female"},
  {name:"Björn Eriksson",gender:"male"},{name:"Linnea Karlsson",gender:"female"},
  {name:"Mustafa Aydın",gender:"male"},{name:"Zeynep Kaya",gender:"female"},
  {name:"Ali Rezaei",gender:"male"},{name:"Sara Mohammadi",gender:"female"},
  {name:"Reza Hosseini",gender:"male"},{name:"Maryam Karimi",gender:"female"},
  {name:"Rohan Gupta",gender:"male"},{name:"Priya Iyer",gender:"female"},
  {name:"Vivaan Mehta",gender:"male"},{name:"Kavya Reddy",gender:"female"},
  {name:"Siddharth Nair",gender:"male"},{name:"Neha Kapoor",gender:"female"},
  {name:"Minh Nguyễn",gender:"nonbinary"},{name:"Linh Phạm",gender:"female"},
  {name:"Bao Trần",gender:"male"},{name:"Thu Hoàng",gender:"female"},
  {name:"Sokha Chan",gender:"male"},{name:"Sreyneang Lim",gender:"female"},
  {name:"Nurul Islam",gender:"female"},{name:"Tasnim Akter",gender:"female"},
  {name:"Siti Aisyah",gender:"female"},{name:"Muhammad Firdaus",gender:"male"},
  {name:"Aisyah Abdullah",gender:"female"},{name:"Farhan Ismail",gender:"male"},
  {name:"Naledi Molefe",gender:"female"},{name:"Thabo Dlamini",gender:"male"},
  {name:"Sipho Nkosi",gender:"male"},{name:"Lerato Mokoena",gender:"female"},
  {name:"Chinedu Eze",gender:"male"},{name:"Chioma Obi",gender:"female"},
  {name:"José Gutierrez",gender:"male"},{name:"Daniela Vargas",gender:"female"},
  {name:"Mateus Oliveira",gender:"male"},{name:"Fernanda Lima",gender:"female"},
  {name:"Tyler Nguyen",gender:"male"},{name:"Ashley Kim",gender:"female"},
  {name:"Brandon Patel",gender:"male"},{name:"Madison Chen",gender:"female"},
  {name:"Austin Garcia",gender:"male"},{name:"Lauren Rodriguez",gender:"female"},
  {name:"Jordan Hernandez",gender:"nonbinary"},{name:"Megan Lopez",gender:"female"},
  {name:"Cameron Martinez",gender:"male"},{name:"Brianna Gonzalez",gender:"female"},
  {name:"Dylan Rivera",gender:"male"},{name:"Kayla Flores",gender:"female"},
  {name:"Connor Torres",gender:"male"},{name:"Sydney Cruz",gender:"female"},
  {name:"Justin Ramirez",gender:"male"},{name:"Morgan Morales",gender:"nonbinary"},
  {name:"Zachary Castillo",gender:"male"},{name:"Hailey Chavez",gender:"female"},
  {name:"Kevin Park",gender:"male"},{name:"Rachel Lee",gender:"female"},
  {name:"Andrew Lin",gender:"male"},{name:"Jessica Wong",gender:"female"},
  {name:"Eric Liu",gender:"male"},{name:"Michelle Huang",gender:"female"},
  {name:"Brian Tran",gender:"male"},{name:"Emily Pham",gender:"female"},
  {name:"Jason Ho",gender:"male"},{name:"Nicole Dang",gender:"female"},
  {name:"Ryan Vo",gender:"male"},{name:"Stephanie Lam",gender:"female"},
  {name:"Alex Hassan",gender:"nonbinary"},{name:"Lauren Rahman",gender:"female"},
  {name:"Matthew Ali",gender:"male"},{name:"Olivia Khan",gender:"female"},
  {name:"Nathan Siddiqui",gender:"male"},{name:"Grace Ahmed",gender:"female"},
  {name:"Joshua Singh",gender:"male"},{name:"Emma Kaur",gender:"female"},
  {name:"Ethan Shah",gender:"male"},{name:"Chloe Desai",gender:"female"},
  {name:"Brandon Mehta",gender:"male"},{name:"Maya Kapoor",gender:"female"},
  {name:"Tyler Okafor",gender:"male"},{name:"Samantha Mensah",gender:"female"},
  {name:"Jacob Boateng",gender:"male"},{name:"Madeline Nwosu",gender:"female"},
  {name:"Logan Adeyemi",gender:"nonbinary"},{name:"Brooke Eze",gender:"female"},
  {name:"Christian Silva",gender:"male"},{name:"Ashley Costa",gender:"female"},
  // 60 Western-style first names + ethnic last names:
{name:"Rose Nguyen",gender:"female"},{name:"Jasper Okafor",gender:"male"},
{name:"Iris Hernandez",gender:"female"},{name:"Theo Nakamura",gender:"male"},
{name:"Dahlia Patel",gender:"female"},{name:"Elliot Hassan",gender:"male"},
{name:"Ivy Choudhury",gender:"female"},{name:"Caleb Mensah",gender:"male"},
{name:"Poppy Kim",gender:"female"},{name:"Miles Alvarez",gender:"male"},
{name:"Willow Chen",gender:"female"},{name:"Rowan Dlamini",gender:"male"},
{name:"Jasmine Nguyen",gender:"female"},{name:"Elliott Banerjee",gender:"male"},
{name:"Daisy Rahman",gender:"female"},{name:"Silas Adeyemi",gender:"male"},
{name:"Lily Okonkwo",gender:"female"},{name:"Bennett Singh",gender:"male"},
{name:"Flora Zhang",gender:"female"},{name:"Wesley Ibrahim",gender:"male"},
{name:"Violet Adebayo",gender:"female"},{name:"Nolan Takahashi",gender:"male"},
{name:"Rosemary Das",gender:"female"},{name:"Everett Haddad",gender:"male"},
{name:"Iris Morales",gender:"female"},{name:"Graham Choi",gender:"male"},
{name:"Marigold Hassan",gender:"female"},{name:"Sawyer Flores",gender:"male"},
{name:"Magnolia Tran",gender:"female"},{name:"Emmett Sato",gender:"male"},
{name:"Hazel Adeyemi",gender:"female"},{name:"Finn Osei",gender:"male"},
{name:"Azalea Kapoor",gender:"female"},{name:"Arthur Rahimi",gender:"male"},
{name:"Heather Nguyen",gender:"female"},{name:"Cole Ibrahim",gender:"male"},
{name:"Lavender Shah",gender:"female"},{name:"Spencer Okafor",gender:"male"},
{name:"Camellia Park",gender:"female"},{name:"Bodhi Fernández",gender:"male"},
{name:"Primrose Chen",gender:"female"},{name:"Dean Mbeki",gender:"male"},
{name:"Daphne Ali",gender:"female"},{name:"Reid Nakamura",gender:"male"},
{name:"Petunia Gupta",gender:"female"},{name:"Grant Mensah",gender:"male"},
{name:"Gardenia Flores",gender:"female"},{name:"Blake Hassan",gender:"male"},
{name:"Magnolia Reyes",gender:"female"},{name:"Clark Nguyen",gender:"male"},
{name:"Aster Kim",gender:"female"},{name:"Blaine Patel",gender:"male"},
{name:"Begonia Torres",gender:"female"},{name:"Hayes Okafor",gender:"male"},
{name:"Clover Singh",gender:"female"},{name:"Reese Nakamura",gender:"nonbinary"},
{name:"Bluebell Chen",gender:"female"},{name:"Tate Dlamini",gender:"male"},
{name:"Sunflower Ali",gender:"female"},{name:"Milo Banerjee",gender:"male"},

// 20 Western names:
{name:"James Whitaker",gender:"male"},{name:"Eleanor Brooks",gender:"female"},
{name:"Charles Montgomery",gender:"male"},{name:"Rosemary Fletcher",gender:"female"},
{name:"William Prescott",gender:"male"},{name:"Florence Harrington",gender:"female"},
{name:"Edward Sinclair",gender:"male"},{name:"Ivy Kensington",gender:"female"},
{name:"Arthur Caldwell",gender:"male"},{name:"Daisy Thornton",gender:"female"},
{name:"Samuel Harrison",gender:"male"},{name:"Violet Beaumont",gender:"female"},
{name:"Frederick Lawson",gender:"male"},{name:"Lillian Mercer",gender:"female"},
{name:"Henry Sheffield",gender:"male"},{name:"Poppy Wallace",gender:"female"},
{name:"George Marshall",gender:"male"},{name:"Hazel Prescott",gender:"female"},
{name:"Edward Fletcher",gender:"male"},{name:"Rosalie Sterling",gender:"female"},

// 20 ethnic names:
{name:"Sanjay Kulkarni",gender:"male"},{name:"Meera Srinivasan",gender:"female"},
{name:"Kaito Watanabe",gender:"male"},{name:"Sakura Kobayashi",gender:"female"},
{name:"Joon-ho Choi",gender:"male"},{name:"Soo-jin Han",gender:"female"},
{name:"Ousmane Diallo",gender:"male"},{name:"Awa Diop",gender:"female"},
{name:"Chukwudi Nnamani",gender:"male"},{name:"Amara Eze",gender:"female"},
{name:"Hassan Mahmoud",gender:"male"},{name:"Leila Farouk",gender:"female"},
{name:"Nabil Darwish",gender:"male"},{name:"Samira Mansouri",gender:"female"},
{name:"Nguyen Quang",gender:"male"},{name:"Mai Bùi",gender:"female"},
{name:"Somchai Srisuk",gender:"male"},{name:"Kanya Chaiyaporn",gender:"female"},
{name:"Thabo Maseko",gender:"male"},{name:"Zanele Khumalo",gender:"female"},

// 60 Western-style first names + ethnic last names:
{name:"Luna Rodriguez",gender:"female"},{name:"Asher Williams",gender:"male"},
{name:"Jade Nguyen",gender:"female"},{name:"Carter Okafor",gender:"male"},
{name:"Magnolia Singh",gender:"female"},{name:"Declan Hassan",gender:"male"},
{name:"Lilac Chen",gender:"female"},{name:"Beckett Mensah",gender:"male"},
{name:"Fern Patel",gender:"female"},{name:"Archie Nakamura",gender:"male"},
{name:"Wisteria Kim",gender:"female"},{name:"Holden Alvarez",gender:"male"},
{name:"Pansy Rahman",gender:"female"},{name:"Ronan Adeyemi",gender:"male"},
{name:"Dahlia Torres",gender:"female"},{name:"Lachlan Nguyen",gender:"male"},
{name:"Petal Hassan",gender:"female"},{name:"Griffin Banerjee",gender:"male"},
{name:"Freesia Park",gender:"female"},{name:"Cameron Ibrahim",gender:"male"},
{name:"Holly Flores",gender:"female"},{name:"Tristan Okonkwo",gender:"male"},
{name:"Lotus Gupta",gender:"female"},{name:"Callum Osei",gender:"male"},
{name:"Heather Morales",gender:"female"},{name:"Rhys Takahashi",gender:"male"},
{name:"Azalea Khan",gender:"female"},{name:"Gideon Silva",gender:"male"},
{name:"Magnolia Chen",gender:"female"},{name:"Nico Dlamini",gender:"male"},
{name:"Primrose Ahmed",gender:"female"},{name:"Alistair Singh",gender:"male"},
{name:"Bluebell Tran",gender:"female"},{name:"Finnian Okafor",gender:"male"},
{name:"Verbena Patel",gender:"female"},{name:"Malcolm Nguyen",gender:"male"},
{name:"Marigold Kim",gender:"female"},{name:"Callan Hassan",gender:"male"},
{name:"Jonquil Reyes",gender:"female"},{name:"Bennett Choi",gender:"male"},
{name:"Petunia Shah",gender:"female"},{name:"Spencer Adeyemi",gender:"male"},
{name:"Camellia Flores",gender:"female"},{name:"Weston Nakamura",gender:"male"},
{name:"Gardenia Rahman",gender:"female"},{name:"Graham Okafor",gender:"male"},
{name:"Zinnia Morales",gender:"female"},{name:"Maddox Singh",gender:"male"},
{name:"Clover Chen",gender:"female"},{name:"Everett Hassan",gender:"male"},
{name:"Tansy Nguyen",gender:"female"},{name:"Brooks Patel",gender:"male"},
{name:"Anemone Kim",gender:"female"},{name:"Harrison Mensah",gender:"male"},
{name:"Cosmos Tran",gender:"female"},{name:"Quincy Dlamini",gender:"male"},
{name:"Myrtle Garcia",gender:"female"},{name:"Sterling Okafor",gender:"male"},
{name:"Nerine Ali",gender:"female"},{name:"Cyrus Banerjee",gender:"male"},

// 20 Western names:
{name:"Alexander Hamilton",gender:"male"},{name:"Elizabeth Monroe",gender:"female"},
{name:"Theodore Bennett",gender:"male"},{name:"Rosalind Harper",gender:"female"},
{name:"William Lancaster",gender:"male"},{name:"Evangeline Brooks",gender:"female"},
{name:"Charles Weston",gender:"male"},{name:"Cordelia Hayes",gender:"female"},
{name:"Frederick Palmer",gender:"male"},{name:"Beatrice Collins",gender:"female"},
{name:"Nicholas Sterling",gender:"male"},{name:"Cecilia Warren",gender:"female"},
{name:"Jonathan Fletcher",gender:"male"},{name:"Genevieve Porter",gender:"female"},
{name:"Maxwell Grant",gender:"male"},{name:"Arabella Spencer",gender:"female"},
{name:"Lawrence Whitmore",gender:"male"},{name:"Ophelia Crawford",gender:"female"},
{name:"Vincent Rutherford",gender:"male"},{name:"Camille Westbrook",gender:"female"},

// 20 ethnic names:
{name:"Aarav Joshi",gender:"male"},{name:"Ishita Mukherjee",gender:"female"},
{name:"Daiki Yamamoto",gender:"male"},{name:"Hana Ishikawa",gender:"female"},
{name:"Seong-min Jung",gender:"male"},{name:"Hye-jin Yoon",gender:"female"},
{name:"Mamadou Toure",gender:"male"},{name:"Fatou Ndiaye",gender:"female"},
{name:"Emeka Chukwu",gender:"male"},{name:"Ngozi Eze",gender:"female"},
{name:"Tariq Nasser",gender:"male"},{name:"Layla Mansour",gender:"female"},
{name:"Karim Haddad",gender:"male"},{name:"Noura Khaled",gender:"female"},
{name:"Phuc Dang",gender:"male"},{name:"Huong Tran",gender:"female"},
{name:"Preecha Kittisak",gender:"male"},{name:"Suda Rattanakul",gender:"female"},
{name:"Kagiso Mokoena",gender:"male"},{name:"Thandiwe Ndlovu",gender:"female"},

];

// Maps a name's gender tag to the pronoun-set key pronouns.js's PRONOUN_SETS
// uses ("he"/"she"/"they") — same mapping App.jsx's pronounKeyFor uses for
// patient gender, kept consistent here for crew.
export function pronounForGender(gender){
  if(gender==="male") return "he";
  if(gender==="female") return "she";
  return "they";
}

// NAME_POOL entries are "First Last" — dialogue between two people who
// know each other reads naturally in first name only (a supervisor calling
// a probationary partner by their full legal name every line is stilted).
// Used at every campaign dialogue site that speaks a drawn NPC's name.
export function firstName(fullName){ return (fullName||"").split(" ")[0]; }

let namePool=[];
export function drawName(){
  if(namePool.length===0) namePool=[...NAME_POOL];
  const i=Math.floor(Math.random()*namePool.length);
  return namePool.splice(i,1)[0];
}

// A player-facing "randomize" pick, distinct from drawName(): this is a
// repeatable UI action (click again for another one), not a draining draw
// meant to avoid repeats across a shift, so it reads straight off the full
// NAME_POOL every time rather than sharing drawName()'s stateful pool.
// `genderTag` is one of NAME_POOL's own tags ("male"/"female"/"nonbinary");
// an unrecognized or omitted tag draws from the whole pool unfiltered.
export function drawNameByGender(genderTag){
  const pool=NAME_POOL.filter(n=>n.gender===genderTag);
  const from=pool.length?pool:NAME_POOL;
  return from[Math.floor(Math.random()*from.length)];
}
