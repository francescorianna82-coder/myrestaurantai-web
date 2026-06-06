export const mockRestaurant = {
  id:          'rest_001',
  slug:        'freddys',
  name:        "Freddy's Bistrot",
  tagline:     'Cucina di mare creativa nel cuore di Ostia',
  tagline_en:  'Creative seafood cuisine in the heart of Ostia',
  description: "Freddy's Bistrot è un ristorante gourmet di pesce fresco a Ostia. Una cucina di mare creativa e mediterranea, con ingredienti selezionati e una proposta sempre sorprendente.",
  description_en: "Freddy's Bistrot is a gourmet fresh fish restaurant in Ostia. Creative Mediterranean seafood cuisine with carefully selected ingredients and an ever-surprising menu.",
  logo:        null,
  brandColor:  '#1a2744',
  accentColor: '#c9a96e',
  textColor:   '#f5f0e8',
  address:     'Viale dei Promontori 216, 00122 Lido di Ostia, Roma',
  phone:       '+39 340 374 2132',
  whatsapp:    '+39 340 374 2132',
  email:       'federicoteresi6@gmail.com',
  instagram:   'https://instagram.com/freddysbistrot',
  facebook:    'https://facebook.com/freddysbistrot',
  mapsUrl:     'https://maps.google.com/?q=Viale+dei+Promontori+216+Ostia+Roma',
  cuisineType:    'Pesce e frutti di mare',
  cuisineType_en: 'Fish and seafood',
  openingHours: {
    it: 'Lun · Mer–Gio 19:30–23:00 · Ven–Sab 12:00–15:00 · 19:30–23:00 · Dom 12:30–15:00 · Mar chiuso',
    en: 'Mon · Wed–Thu 19:30–23:00 · Fri–Sat 12:00–15:00 · 19:30–23:00 · Sun 12:30–15:00 · Tue closed',
  },
  poweredBy: true,
};

export const mockDishes = [
  // IL BANCONE
  { id: 'd01', restaurantId: 'rest_001', name: 'Sauté di cozze', description: 'Cozze fresche in brodetto', price: 10.00, category: 'bancone', image: null, badges: ['recommended'], allergens: ['molluscs'], available: true },
  { id: 'd02', restaurantId: 'rest_001', name: 'Moscardini alla luciana', description: 'Moscardini con crostini di pane', price: 11.00, category: 'bancone', image: null, badges: ['homemade'], allergens: ['gluten', 'molluscs'], available: true },
  { id: 'd03', restaurantId: 'rest_001', name: 'Carpaccio', description: 'Carpaccio di pesce fresco di stagione', price: 12.00, category: 'bancone', image: null, badges: [], allergens: ['fish'], available: true },

  // ANTIPASTI
  { id: 'd04', restaurantId: 'rest_001', name: 'Tris di bruschette di mare', description: 'Tre bruschette con condimenti di mare', price: 10.00, category: 'antipasti', image: null, badges: ['recommended'], allergens: ['gluten', 'fish', 'molluscs'], available: true },
  { id: 'd05', restaurantId: 'rest_001', name: 'Tartare di tonno', description: 'In crosta di pane e scarola con ketchup al cachi', price: 14.00, category: 'antipasti', image: null, badges: ['new'], allergens: ['gluten', 'fish'], available: true },
  { id: 'd06', restaurantId: 'rest_001', name: 'Polpo e patate in doppia cottura', description: 'Maionese al wasabi e fumo di ciliegia', price: 15.00, category: 'antipasti', image: null, badges: ['recommended', 'homemade'], allergens: ['molluscs', 'eggs'], available: true },
  { id: 'd07', restaurantId: 'rest_001', name: 'Supplì al ragù di seppia', description: 'Supplì romani con ragù di seppia', price: 9.00, category: 'antipasti', image: null, badges: ['homemade'], allergens: ['gluten', 'eggs', 'molluscs'], available: true },
  { id: 'd08', restaurantId: 'rest_001', name: 'Carpaccio di spigola', description: 'Spigola fresca in carpaccio con agrumi', price: 13.00, category: 'antipasti', image: null, badges: [], allergens: ['fish'], available: true },
  { id: 'd09', restaurantId: 'rest_001', name: 'Crudo di pesce di stagione', description: 'Carpaccio, crostacei, ostriche', price: 18.00, category: 'antipasti', image: null, badges: ['dailySpecial'], allergens: ['fish', 'crustaceans', 'molluscs'], available: true },

  // PRIMI
  { id: 'd10', restaurantId: 'rest_001', name: 'Spaghetti alle vongole', description: 'Con vongole veracissime, aglio, olio e prezzemolo', price: 18.00, category: 'primi', image: null, badges: ['recommended', 'homemade'], allergens: ['gluten', 'molluscs'], available: true },
  { id: 'd11', restaurantId: 'rest_001', name: 'Carbonara di mare', description: 'La nostra carbonara di mare', price: 18.00, category: 'primi', image: null, badges: ['homemade', 'new'], allergens: ['gluten', 'eggs', 'fish'], available: true },
  { id: 'd12', restaurantId: 'rest_001', name: 'Minestra di arzilla', description: 'Con broccolo romanesco come una volta', price: 16.00, category: 'primi', image: null, badges: ['homemade'], allergens: ['gluten', 'fish'], available: true },
  { id: 'd13', restaurantId: 'rest_001', name: 'Gnocco con cavolo nero', description: 'Seppia e stracchino', price: 17.00, category: 'primi', image: null, badges: [], allergens: ['gluten', 'milk', 'molluscs'], available: true },
  { id: 'd14', restaurantId: 'rest_001', name: 'Paccheri ragù di polpo', description: 'Con stracciatella di bufala', price: 19.00, category: 'primi', image: null, badges: ['recommended'], allergens: ['gluten', 'milk', 'molluscs'], available: true },
  { id: 'd15', restaurantId: 'rest_001', name: 'Risotto con crema di castagne', description: 'Pannocchie e tartufo nero', price: 22.00, category: 'primi', image: null, badges: ['dailySpecial'], allergens: ['crustaceans'], available: true },

  // SECONDI
  { id: 'd16', restaurantId: 'rest_001', name: 'Fritto calamari e paranza', description: 'Frittura mista leggera di calamari e pesciolini', price: 20.00, category: 'secondi', image: null, badges: ['recommended'], allergens: ['gluten', 'fish', 'molluscs'], available: true },
  { id: 'd17', restaurantId: 'rest_001', name: 'Filetto di sogliola alla mugnaia', description: 'Sogliola fresca in burro e limone', price: 22.00, category: 'secondi', image: null, badges: [], allergens: ['fish', 'milk', 'gluten'], available: true },
  { id: 'd18', restaurantId: 'rest_001', name: 'Trancio di pescato all\'acqua pazza', description: 'Pesce fresco del giorno in acqua pazza', price: 24.00, category: 'secondi', image: null, badges: ['dailySpecial'], allergens: ['fish'], available: true },
  { id: 'd19', restaurantId: 'rest_001', name: 'Astice intero', description: 'Con crema di topinambur, patata dolce affumicata e salsa bloody mary', price: 48.00, category: 'secondi', image: null, badges: ['recommended', 'new'], allergens: ['crustaceans'], available: true },
  { id: 'd20', restaurantId: 'rest_001', name: 'Pescato intero', description: 'Pesce intero del giorno — prezzo al etto', price: 8.00, category: 'secondi', image: null, badges: [], allergens: ['fish'], available: true },

  // DOLCI
  { id: 'd21', restaurantId: 'rest_001', name: 'Tiramisù', description: 'Tiramisù della casa', price: 7.00, category: 'dolci', image: null, badges: ['homemade'], allergens: ['gluten', 'eggs', 'milk'], available: true },
  { id: 'd22', restaurantId: 'rest_001', name: 'Cheesecake frutti di bosco', description: 'Cheesecake artigianale con coulis di frutti di bosco', price: 7.00, category: 'dolci', image: null, badges: ['homemade'], allergens: ['gluten', 'milk', 'eggs'], available: true },
  { id: 'd23', restaurantId: 'rest_001', name: 'Tortino al cioccolato', description: 'Con cuore fondente e gelato alla vaniglia', price: 8.00, category: 'dolci', image: null, badges: ['recommended'], allergens: ['gluten', 'eggs', 'milk'], available: true },
  { id: 'd24', restaurantId: 'rest_001', name: 'Pasta fillo con pere e cioccolato', description: 'Dolce croccante con pere caramellate e cioccolato fondente', price: 8.00, category: 'dolci', image: null, badges: ['new'], allergens: ['gluten', 'milk'], available: true },
];

const today    = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

export const mockMenus = [
  {
    id:            'menu_001',
    restaurantId:  'rest_001',
    title:         'Menu del giorno',
    frequencyType: 'daily',
    validFrom:     todayStr,
    validTo:       todayStr,
    validWeekDays: null,
    timeSlot:      'allDay',
    status:        'published',
    priority:      10,
    categories: [
      { id: 'cat_01', name: 'Il Bancone',  name_en: 'The Counter',    items: ['d01','d02','d03'] },
      { id: 'cat_02', name: 'Antipasti',   name_en: 'Starters',       items: ['d04','d05','d06','d07','d08','d09'] },
      { id: 'cat_03', name: 'Primi',       name_en: 'First courses',  items: ['d10','d11','d12','d13','d14','d15'] },
      { id: 'cat_04', name: 'Secondi',     name_en: 'Main courses',   items: ['d16','d17','d18','d19','d20'] },
      { id: 'cat_05', name: 'Dolci',       name_en: 'Desserts',       items: ['d21','d22','d23','d24'] },
    ],
  },
];
