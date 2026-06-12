/* =============================================
   MEALPILOT — app.js
   Nigerian Meal Planner · Budget Tools · Tracker
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
//  DATA: 50+ NIGERIAN MEALS
// ─────────────────────────────────────────────
const MEALS = [
  // RICE
  { id:1, name:'Jollof Rice', category:'Rice', emoji:'🍚', cost:2500, servings:4, ingredients:['rice','tomatoes','peppers','onion','chicken','vegetable oil','seasoning','bay leaf'] },
  { id:2, name:'Fried Rice', category:'Rice', emoji:'🍳', cost:3000, servings:4, ingredients:['rice','carrot','green beans','green peas','eggs','soy sauce','vegetable oil','chicken','onion'] },
  { id:3, name:'Coconut Rice', category:'Rice', emoji:'🥥', cost:2200, servings:4, ingredients:['rice','coconut milk','tomatoes','peppers','onion','seasoning','vegetable oil'] },
  { id:4, name:'White Rice and Stew', category:'Rice', emoji:'🍲', cost:2000, servings:4, ingredients:['rice','tomatoes','peppers','onion','vegetable oil','chicken','seasoning'] },
  { id:5, name:'Rice and Beans', category:'Rice', emoji:'🫘', cost:1200, servings:4, ingredients:['rice','brown beans','palm oil','pepper','onion','seasoning'] },
  { id:6, name:'Ofada Rice and Stew', category:'Rice', emoji:'🌿', cost:2800, servings:3, ingredients:['ofada rice','assorted meat','palm oil','locust beans','peppers','onion','ponmo'] },
  { id:7, name:'Tomato Fried Rice', category:'Rice', emoji:'🍅', cost:2000, servings:4, ingredients:['rice','tomato paste','carrot','green beans','onion','vegetable oil','seasoning'] },
  { id:8, name:'Spaghetti Jollof', category:'Rice', emoji:'🍝', cost:1800, servings:4, ingredients:['spaghetti','tomatoes','peppers','onion','vegetable oil','seasoning','chicken'] },

  // SOUPS
  { id:9, name:'Egusi Soup', category:'Soups', emoji:'🥣', cost:3500, servings:6, ingredients:['egusi','spinach','assorted meat','palm oil','crayfish','onion','peppers','seasoning','stockfish'] },
  { id:10, name:'Okra Soup', category:'Soups', emoji:'🫑', cost:2500, servings:5, ingredients:['okra','assorted meat','palm oil','crayfish','peppers','onion','seasoning','stockfish'] },
  { id:11, name:'Banga Soup', category:'Soups', emoji:'🌴', cost:3200, servings:5, ingredients:['palm fruit','catfish','crayfish','peppers','onion','banga spice','oruwo','seasoning'] },
  { id:12, name:'Oha Soup', category:'Soups', emoji:'🌿', cost:3000, servings:5, ingredients:['oha leaves','cocoyam','assorted meat','palm oil','crayfish','peppers','stockfish'] },
  { id:13, name:'Efo Riro', category:'Soups', emoji:'🥬', cost:2800, servings:5, ingredients:['spinach','assorted meat','palm oil','peppers','onion','locust beans','crayfish','seasoning'] },
  { id:14, name:'Afang Soup', category:'Soups', emoji:'🌱', cost:3500, servings:5, ingredients:['afang leaves','waterleaf','assorted meat','palm oil','periwinkle','crayfish','seasoning'] },
  { id:15, name:'Pepper Soup', category:'Soups', emoji:'🌶️', cost:2500, servings:4, ingredients:['goat meat','pepper soup spice','uziza leaves','peppers','onion','crayfish','seasoning'] },
  { id:16, name:'Bitter Leaf Soup', category:'Soups', emoji:'🥗', cost:2800, servings:5, ingredients:['bitter leaf','cocoyam','assorted meat','palm oil','crayfish','peppers','seasoning'] },
  { id:17, name:'Ogbono Soup', category:'Soups', emoji:'🫙', cost:2600, servings:5, ingredients:['ogbono seeds','spinach','assorted meat','palm oil','crayfish','peppers','seasoning'] },
  { id:18, name:'Catfish Pepper Soup', category:'Soups', emoji:'🐟', cost:3500, servings:4, ingredients:['catfish','pepper soup spice','uziza','peppers','onion','seasoning','crayfish'] },
  { id:19, name:'Vegetable Soup (Edikang Ikong)', category:'Soups', emoji:'🥦', cost:3200, servings:5, ingredients:['waterleaf','ugwu','assorted meat','palm oil','periwinkle','crayfish','seasoning'] },

  // SWALLOWS
  { id:20, name:'Eba and Egusi', category:'Swallows', emoji:'🫓', cost:1500, servings:3, ingredients:['garri','egusi','palm oil','assorted meat','crayfish','peppers','seasoning'] },
  { id:21, name:'Pounded Yam and Egusi', category:'Swallows', emoji:'🍠', cost:2800, servings:3, ingredients:['yam','egusi','palm oil','assorted meat','crayfish','peppers','seasoning'] },
  { id:22, name:'Fufu and Okra', category:'Swallows', emoji:'🍚', cost:2000, servings:3, ingredients:['fufu','okra','palm oil','assorted meat','crayfish','peppers','seasoning'] },
  { id:23, name:'Wheat Meal and Efo Riro', category:'Swallows', emoji:'🌾', cost:2500, servings:3, ingredients:['wheat meal','spinach','assorted meat','palm oil','peppers','crayfish'] },
  { id:24, name:'Semovita and Ogbono', category:'Swallows', emoji:'🫙', cost:2200, servings:3, ingredients:['semovita','ogbono','palm oil','assorted meat','crayfish','peppers','seasoning'] },
  { id:25, name:'Amala and Ewedu', category:'Swallows', emoji:'🌿', cost:1800, servings:3, ingredients:['plantain flour','jute leaves','palm oil','beef','peppers','crayfish','locust beans'] },

  // BREAKFAST
  { id:26, name:'Yam and Egg Sauce', category:'Breakfast', emoji:'🥚', cost:1800, servings:3, ingredients:['yam','eggs','tomatoes','peppers','onion','vegetable oil','seasoning'] },
  { id:27, name:'Akara and Pap', category:'Breakfast', emoji:'🫓', cost:800, servings:3, ingredients:['beans','pepper','onion','vegetable oil','corn powder','water'] },
  { id:28, name:'Moi Moi', category:'Breakfast', emoji:'🟤', cost:1000, servings:4, ingredients:['beans','peppers','onion','vegetable oil','eggs','crayfish','seasoning','fish'] },
  { id:29, name:'Noodles and Egg', category:'Breakfast', emoji:'🍜', cost:600, servings:2, ingredients:['noodles','eggs','pepper','onion','vegetable oil','seasoning','carrot'] },
  { id:30, name:'Bread and Egg Sauce', category:'Breakfast', emoji:'🍞', cost:700, servings:2, ingredients:['bread','eggs','tomatoes','peppers','onion','vegetable oil'] },
  { id:31, name:'Plantain and Egg', category:'Breakfast', emoji:'🍌', cost:900, servings:2, ingredients:['ripe plantain','eggs','pepper','onion','vegetable oil'] },
  { id:32, name:'Oatmeal Porridge', category:'Breakfast', emoji:'🥣', cost:600, servings:2, ingredients:['oats','milk','sugar','banana','cinnamon'] },
  { id:33, name:'Yam Pottage (Asaro)', category:'Breakfast', emoji:'🍠', cost:1500, servings:4, ingredients:['yam','palm oil','peppers','onion','crayfish','spinach','seasoning'] },
  { id:34, name:'Beans Porridge', category:'Breakfast', emoji:'🫘', cost:1200, servings:4, ingredients:['brown beans','palm oil','peppers','onion','crayfish','seasoning','plantain'] },
  { id:35, name:'Agege Bread and Akara', category:'Breakfast', emoji:'🥐', cost:700, servings:2, ingredients:['bread','beans','pepper','onion','vegetable oil'] },

  // SNACKS
  { id:36, name:'Puff Puff', category:'Snacks', emoji:'🍩', cost:500, servings:8, ingredients:['flour','sugar','yeast','nutmeg','water','vegetable oil'] },
  { id:37, name:'Chin Chin', category:'Snacks', emoji:'🧁', cost:700, servings:10, ingredients:['flour','sugar','butter','eggs','coconut flavour','vegetable oil'] },
  { id:38, name:'Boli and Groundnut', category:'Snacks', emoji:'🍌', cost:600, servings:2, ingredients:['plantain','groundnut','pepper','salt'] },
  { id:39, name:'Suya', category:'Snacks', emoji:'🍢', cost:1500, servings:3, ingredients:['beef','yaji spice','groundnut','onion','cabbage','tomatoes','pepper'] },
  { id:40, name:'Roasted Corn', category:'Snacks', emoji:'🌽', cost:400, servings:1, ingredients:['corn','water','salt'] },
  { id:41, name:'Fried Yam and Pepper Sauce', category:'Snacks', emoji:'🍟', cost:900, servings:3, ingredients:['yam','vegetable oil','tomatoes','peppers','onion','seasoning'] },
  { id:42, name:'Kilishi', category:'Snacks', emoji:'🥩', cost:1500, servings:4, ingredients:['beef','groundnut paste','yaji spice','salt','maggi'] },
  { id:43, name:'Biscuit Balls', category:'Snacks', emoji:'🍪', cost:300, servings:6, ingredients:['digestive biscuit','milk','butter','cocoa powder','sugar'] },

  // DELICACIES
  { id:44, name:'Nkwobi', category:'Delicacies', emoji:'🥩', cost:3500, servings:4, ingredients:['cow foot','palm oil','ugba','utazi leaves','peppers','crayfish','seasoning','potash'] },
  { id:45, name:'Isi Ewu', category:'Delicacies', emoji:'🐐', cost:4000, servings:4, ingredients:['goat head','palm oil','ugba','utazi','peppers','crayfish','seasoning','potash'] },
  { id:46, name:'Abacha (African Salad)', category:'Delicacies', emoji:'🥗', cost:1800, servings:4, ingredients:['cassava flakes','ugba','palm oil','garden egg','crayfish','peppers','seasoning','onion'] },
  { id:47, name:'Ugba and Garden Egg', category:'Delicacies', emoji:'🫙', cost:1500, servings:3, ingredients:['oil bean','garden egg','palm oil','peppers','crayfish','seasoning'] },
  { id:48, name:'Banga Rice', category:'Delicacies', emoji:'🌴', cost:3000, servings:4, ingredients:['rice','palm fruit','catfish','crayfish','peppers','onion','banga spice','seasoning'] },
  { id:49, name:'Ukwa (Breadfruit)', category:'Delicacies', emoji:'🌰', cost:2500, servings:4, ingredients:['breadfruit','palm oil','peppers','seasoning','crayfish','uziza'] },
  { id:50, name:'Edikang Ikong', category:'Delicacies', emoji:'🥬', cost:3200, servings:5, ingredients:['waterleaf','ugwu','assorted meat','palm oil','periwinkle','crayfish','seasoning'] },
  { id:51, name:'Miyan Kuka', category:'Delicacies', emoji:'🌿', cost:2000, servings:4, ingredients:['kuka leaves','taushe','palm oil','crayfish','peppers','onion','seasoning'] },
  { id:52, name:'Tuwo Shinkafa', category:'Swallows', emoji:'🍚', cost:1600, servings:3, ingredients:['soft rice','water'] },
  { id:53, name:'Dan Wake', category:'Delicacies', emoji:'🫓', cost:1200, servings:4, ingredients:['beans flour','potash','water','palm oil','peppers','crayfish','seasoning'] },
  { id:54, name:'Coconut Candy', category:'Snacks', emoji:'🥥', cost:400, servings:6, ingredients:['coconut','sugar','ginger'] },
  { id:55, name:'Plantain Chips', category:'Snacks', emoji:'🍟', cost:500, servings:4, ingredients:['unripe plantain','vegetable oil','salt','pepper'] },
];

// ─────────────────────────────────────────────
//  DETAILED RECIPES (30 recipes)
// ─────────────────────────────────────────────
const RECIPES = [
  {
    id:1, mealId:1, name:'Jollof Rice', emoji:'🍚', category:'Rice',
    cookTime:60, servings:4, cost:2500,
    ingredients:['3 cups long grain rice','4 large tomatoes','3 red peppers','2 scotch bonnet peppers','2 large onions','½ cup vegetable oil','500g chicken pieces','2 seasoning cubes','1 tsp thyme','1 tsp curry powder','2 bay leaves','Salt to taste'],
    steps:[
      'Season chicken with 1 diced onion, seasoning cubes, thyme, curry, salt. Fry or grill until cooked.',
      'Blend tomatoes, peppers, and 1 onion into a smooth purée.',
      'Heat oil in a heavy pot, fry the remaining onion sliced until golden.',
      'Pour in the blended tomato purée and cook on medium heat for 20–25 minutes, stirring regularly, until the raw tomato smell is gone and oil rises to the top.',
      'Add the chicken stock (or 3 cups water), bay leaves, and remaining seasoning. Taste and adjust.',
      'Wash rice and add to the pot. Stir well. The liquid should just cover the rice.',
      'Cover tightly and cook on low heat for 30 minutes. Check halfway, add a splash of water if needed.',
      'Fluff rice carefully, add chicken back, and serve with fried plantain or salad.',
    ]
  },
  {
    id:2, mealId:9, name:'Egusi Soup', emoji:'🥣', category:'Soups',
    cookTime:50, servings:6, cost:3500,
    ingredients:['2 cups ground egusi (melon seeds)','500g assorted meat (beef, tripe, ponmo)','150g stockfish','3 tbsp palm oil','2 tbsp ground crayfish','1 large onion','3–4 scotch bonnet peppers','2 cups washed bitter leaf or spinach','2 seasoning cubes','Salt to taste'],
    steps:[
      'Cook assorted meat and stockfish with half the onion, salt, and 1 seasoning cube until tender. Reserve the stock.',
      'Mix egusi with a little water to form a paste. Season lightly.',
      'Heat palm oil in a pot. Fry sliced onion and blended peppers for 10 minutes until fragrant.',
      'Add egusi paste in lumps, stirring gently. Fry for 5–8 minutes until it is dry and slightly golden.',
      'Pour in meat stock (add water if needed). Add meat, stockfish, crayfish, and remaining seasoning. Stir.',
      'Simmer on medium heat for 15 minutes. Taste and adjust salt.',
      'Add washed bitter leaf or spinach. Stir and cook for 5 more minutes.',
      'Serve hot with eba, pounded yam, or any swallow.',
    ]
  },
  {
    id:3, mealId:27, name:'Akara (Bean Cakes)', emoji:'🫓', category:'Breakfast',
    cookTime:30, servings:5, cost:800,
    ingredients:['2 cups black-eyed beans (peeled)','1 medium onion','2 scotch bonnet peppers','1 tsp salt','Vegetable oil for deep frying'],
    steps:[
      'Soak beans in water for 30 minutes, then rub between palms to remove the skin. Rinse several times.',
      'Blend beans with onion, peppers, and a little water into a smooth batter. Do not add too much water — batter should be thick.',
      'Add salt and whisk the batter vigorously for 5 minutes to incorporate air (this makes them fluffy).',
      'Heat vegetable oil in a deep pot to 180°C (hot enough that a drop of batter sizzles immediately).',
      'Scoop batter with a spoon and carefully lower into hot oil. Fry in batches for 3–4 minutes, turning once, until golden brown.',
      'Drain on paper towels. Serve hot with pap (ogi/akamu) or as a snack.',
    ]
  },
  {
    id:4, mealId:28, name:'Moi Moi', emoji:'🟤', category:'Breakfast',
    cookTime:60, servings:6, cost:1000,
    ingredients:['3 cups black-eyed beans (peeled)','3 red bell peppers','2 scotch bonnet peppers','1 large onion','¼ cup vegetable oil','2 eggs (hard-boiled, sliced)','100g fish fillet','2 tsp ground crayfish','2 seasoning cubes','Salt to taste'],
    steps:[
      'Peel beans by soaking and rubbing off skins. Blend smooth with peppers and onion using very little water.',
      'Transfer to a bowl. Add oil, crayfish, seasoning cubes, and salt. Mix well.',
      'Pour batter into greased aluminium foil cups or moi moi leaves. Add egg slices and fish.',
      'Fold/seal the cups tightly.',
      'Arrange in a pot, add water to come halfway up the cups. Cover pot tightly.',
      'Steam on medium heat for 45–50 minutes until set. Test by inserting a toothpick — it should come out clean.',
      'Allow to cool slightly before opening. Serve as a side or breakfast.',
    ]
  },
  {
    id:5, mealId:13, name:'Efo Riro', emoji:'🥬', category:'Soups',
    cookTime:45, servings:5, cost:2800,
    ingredients:['500g fresh spinach (tete) or frozen','300g assorted meat (beef, tripe)','3 tbsp palm oil','2 red bell peppers','3 scotch bonnet peppers','1 large onion','2 tbsp locust beans (iru)','2 tbsp ground crayfish','2 seasoning cubes','Salt to taste'],
    steps:[
      'Cook meat with onion, salt, and 1 seasoning cube. Set aside.',
      'Blend bell peppers and scotch bonnets. Set aside.',
      'Heat palm oil in a wide pot. Add sliced onion and locust beans, fry for 3 minutes.',
      'Add blended peppers. Fry on medium heat for 15–20 minutes, stirring often, until sauce is thick and oil floats.',
      'Add cooked meat and stock. Stir in crayfish and remaining seasoning. Taste.',
      'Simmer for 5 minutes, then add washed spinach.',
      'Stir gently and cook for only 3–5 minutes. Do not overcook — spinach should stay bright green.',
      'Serve with any swallow, eba, or steamed rice.',
    ]
  },
  {
    id:6, mealId:26, name:'Yam and Egg Sauce', emoji:'🥚', category:'Breakfast',
    cookTime:30, servings:3, cost:1800,
    ingredients:['½ tuber medium yam','4 large eggs','2 ripe tomatoes','2 scotch bonnet peppers','1 medium onion','3 tbsp vegetable oil','1 seasoning cube','Salt to taste','Spring onions for garnish'],
    steps:[
      'Peel and cut yam into thick slices. Boil in salted water for 15–20 minutes until fork-tender. Drain.',
      'Dice tomatoes, onion, and slice peppers.',
      'Heat oil in a pan. Sauté onion until translucent, about 2 minutes.',
      'Add tomatoes and peppers. Cook on medium heat for 5–7 minutes, stirring, until slightly reduced.',
      'Break eggs into the sauce. Scramble gently or let them set — your preference.',
      'Add seasoning cube and salt. Stir and remove from heat.',
      'Serve egg sauce over hot boiled yam slices. Garnish with spring onions.',
    ]
  },
  {
    id:7, mealId:33, name:'Yam Pottage (Asaro)', emoji:'🍠', category:'Breakfast',
    cookTime:40, servings:4, cost:1500,
    ingredients:['½ tuber yam','3 tbsp palm oil','2 ripe tomatoes','2 scotch bonnet peppers','1 large onion','2 tbsp ground crayfish','A handful of spinach','2 seasoning cubes','Salt to taste'],
    steps:[
      'Peel and cut yam into medium chunks. Rinse well.',
      'Place yam in a pot, add water to cover, and boil for 10 minutes.',
      'Add palm oil, blended tomatoes and peppers, sliced onion, crayfish, and seasoning. Stir.',
      'Continue cooking on medium heat for 15–20 minutes until yam is very soft.',
      'Mash a few yam pieces with a spoon to thicken the pottage. Leave others chunky.',
      'Add spinach, stir, and cook for 2 more minutes.',
      'Taste, adjust salt and serve hot.',
    ]
  },
  {
    id:8, mealId:5, name:'Rice and Beans', emoji:'🫘', category:'Rice',
    cookTime:60, servings:4, cost:1200,
    ingredients:['2 cups long grain rice','1½ cups honey beans (oloyin)','2 tbsp palm oil','2 scotch bonnet peppers','1 large onion','1 seasoning cube','Salt to taste'],
    steps:[
      'Sort and wash beans. Boil for 20 minutes, drain, and rinse (reduces gas).',
      'Return beans to pot with fresh water. Cook until almost soft, about 20 minutes.',
      'Add washed rice to the beans. Add enough water to come 2cm above the mixture.',
      'Add palm oil, sliced onion, peppers, seasoning, and salt.',
      'Stir, cover, and cook on low-medium heat for 25–30 minutes until rice and beans are fully cooked.',
      'Stir gently, taste and adjust. Serve with fried plantain or any protein.',
    ]
  },
  {
    id:9, mealId:34, name:'Beans Porridge', emoji:'🫘', category:'Breakfast',
    cookTime:50, servings:4, cost:1200,
    ingredients:['2 cups brown beans','2 tbsp palm oil','2 ripe plantains','2 scotch bonnet peppers','1 large onion','2 tbsp ground crayfish','2 seasoning cubes','Salt to taste','Smoked fish (optional)'],
    steps:[
      'Sort and wash beans. Boil for 5 minutes, discard water, and add fresh water to cook until soft.',
      'When beans is almost done, add palm oil, blended peppers, sliced onion, crayfish, and seasoning.',
      'Add smoked fish if using. Stir and continue cooking for 15 minutes.',
      'Peel plantains, cut diagonally, and add to the pot.',
      'Cook for another 10 minutes until plantain is soft and beans porridge has thickened.',
      'Mash a few beans for creaminess. Taste and serve.',
    ]
  },
  {
    id:10, mealId:36, name:'Puff Puff', emoji:'🍩', category:'Snacks',
    cookTime:35, servings:8, cost:500,
    ingredients:['3 cups plain flour','2 tsp instant yeast','½ cup sugar','½ tsp nutmeg','1½ cups warm water','1 tsp salt','Vegetable oil for deep frying'],
    steps:[
      'Mix flour, yeast, sugar, nutmeg, and salt in a bowl.',
      'Gradually add warm water and mix until you have a smooth, thick batter. Do not over-mix.',
      'Cover with a damp cloth and leave in a warm spot for 45 minutes–1 hour until doubled in size.',
      'Heat oil in a deep pot to 175°C.',
      'Use a spoon or hand to scoop batter and carefully drop round balls into hot oil.',
      'Fry in batches for 3–4 minutes, turning regularly, until golden brown.',
      'Drain on paper towels. Enjoy warm. Optionally dust with icing sugar.',
    ]
  },
  {
    id:11, mealId:2, name:'Nigerian Fried Rice', emoji:'🍳', category:'Rice',
    cookTime:50, servings:4, cost:3000,
    ingredients:['3 cups parboiled rice','200g mixed vegetables (carrot, green beans, peas)','3 eggs','200g shrimp or chicken','2 tbsp soy sauce','1 tsp curry powder','1 large onion','3 tbsp vegetable oil','2 seasoning cubes','Salt and white pepper'],
    steps:[
      'Parboil rice until half-done, drain and spread to cool.',
      'Season chicken or shrimp and stir-fry in 1 tbsp oil until cooked. Remove and set aside.',
      'In the same pot, scramble eggs in 1 tbsp oil. Push to the side.',
      'Add remaining oil, sauté onion, add carrots and green beans, fry for 3 minutes.',
      'Add rice to the pot. Mix everything together.',
      'Add soy sauce, curry powder, seasoning, salt, and pepper. Toss well.',
      'Add peas and protein. Stir-fry on high heat for 5 minutes until well combined and slightly charred.',
      'Serve with fried chicken or beef.',
    ]
  },
  {
    id:12, mealId:14, name:'Afang Soup', emoji:'🌱', category:'Soups',
    cookTime:50, servings:5, cost:3500,
    ingredients:['400g afang leaves (sliced thin)','400g waterleaf','400g assorted meat','200g periwinkle','3 tbsp palm oil','3 tbsp ground crayfish','2 seasoning cubes','3 scotch bonnet peppers','Stockfish and smoked fish','Salt to taste'],
    steps:[
      'Cook assorted meat and stockfish with seasoning until tender. Reserve stock.',
      'Rinse waterleaf and squeeze out excess water.',
      'Heat palm oil in a pot. Add blended peppers and cook for 5 minutes.',
      'Add meat, smoked fish, stockfish, crayfish, and remaining seasoning. Stir.',
      'Add periwinkle and pour in a little stock. Cook for 5 minutes.',
      'Add waterleaf, stir and cook for 3 minutes.',
      'Add the sliced afang leaves (do not cover the pot). Stir and cook for exactly 5 minutes.',
      'Taste, adjust, and serve with any swallow.',
    ]
  },
  {
    id:13, mealId:39, name:'Suya', emoji:'🍢', category:'Snacks',
    cookTime:30, servings:3, cost:1500,
    ingredients:['500g beef (sirloin or rump)','4 tbsp ground groundnut','2 tbsp yaji (suya spice)','1 tsp ginger powder','1 tsp garlic powder','1 tsp paprika','Salt to taste','Sliced tomatoes, onions, cabbage to serve'],
    steps:[
      'Slice beef very thin — about 3–4mm thick.',
      'Mix groundnut, yaji, ginger, garlic, paprika, and salt in a bowl.',
      'Coat each beef slice thoroughly with the spice mixture.',
      'Thread onto skewers (or lay flat on a wire rack).',
      'Grill on a charcoal or gas grill at high heat for 5–6 minutes per side.',
      'Optionally brush with groundnut oil halfway through for shine.',
      'Serve with fresh sliced onions, tomatoes, and cabbage.',
    ]
  },
  {
    id:14, mealId:15, name:'Goat Meat Pepper Soup', emoji:'🌶️', category:'Soups',
    cookTime:55, servings:4, cost:2500,
    ingredients:['600g goat meat','2 tbsp pepper soup spice mix','2 scotch bonnet peppers','1 medium onion','A handful of uziza leaves','2 seasoning cubes','2 tbsp ground crayfish','Salt to taste','Water'],
    steps:[
      'Wash goat meat thoroughly. Place in a pot.',
      'Add sliced onion, seasoning cubes, salt, and half the pepper soup spice. Mix well.',
      'Cover pot without water and steam on medium heat for 10 minutes.',
      'Add 4–5 cups of water. Cook on medium-high heat for 25 minutes until meat is almost tender.',
      'Add blended scotch bonnets, crayfish, and remaining pepper soup spice.',
      'Continue cooking for 10 minutes. Taste and adjust seasoning.',
      'Add sliced uziza leaves. Cook for 3 more minutes.',
      'Serve hot in bowls. Best enjoyed as is or with boiled yam.',
    ]
  },
  {
    id:15, mealId:46, name:'Abacha (African Salad)', emoji:'🥗', category:'Delicacies',
    cookTime:20, servings:4, cost:1800,
    ingredients:['2 cups cassava flakes (abacha)','200g ugba (oil bean)','3 tbsp palm oil','1 tsp potash dissolved in water','2 tbsp ground crayfish','3 garden eggs','2 seasoning cubes','Utazi leaves','Peppers, onion to taste','Smoked fish','Salt to taste'],
    steps:[
      'Soak abacha in hot water for 10 minutes until softened. Drain and rinse with cold water.',
      'Mix palm oil with the potash solution until it emulsifies into a bright orange thick paste.',
      'Season palm oil mix with crayfish, crumbled seasoning cubes, salt, and sliced peppers.',
      'Add ugba, abacha, and shredded smoked fish to the palm oil mix. Toss to combine.',
      'Slice garden eggs into wedges and add to the salad.',
      'Chiffonade utazi leaves and toss in.',
      'Taste and adjust. Add thinly sliced onion rings on top. Serve immediately.',
    ]
  },
  {
    id:16, mealId:6, name:'Ofada Rice and Stew', emoji:'🌿', category:'Rice',
    cookTime:60, servings:3, cost:2800,
    ingredients:['2 cups ofada rice','400g assorted meat (beef, tripe, ponmo)','3 red bell peppers','5 tatashé peppers','5 scotch bonnet peppers','3 tbsp palm oil','3 tbsp locust beans (iru)','2 seasoning cubes','Crayfish to taste','Salt to taste'],
    steps:[
      'Wash ofada rice thoroughly (it will remain slightly brown/earthy in colour). Cook until tender, drain.',
      'Cook assorted meat with seasoning and onion until tender. Reserve stock.',
      'Dry-roast tatashé and scotch bonnet peppers in a hot pan until slightly charred.',
      'Blend the roasted peppers roughly (not too smooth — some texture preferred).',
      'Heat palm oil in a heavy pot until hot. Add locust beans and fry for 1 minute.',
      'Pour in blended peppers. Fry on medium-high heat for 20–25 minutes, stirring constantly.',
      'Add cooked assorted meat and some stock. Season, add crayfish. Cook 10 more minutes.',
      'Serve ofada rice wrapped in banana leaf with generous stew on top.',
    ]
  },
  {
    id:17, mealId:3, name:'Coconut Rice', emoji:'🥥', category:'Rice',
    cookTime:40, servings:4, cost:2200,
    ingredients:['3 cups rice','400ml coconut milk','2 cups water','2 tomatoes','2 peppers','1 onion','2 tbsp vegetable oil','2 seasoning cubes','Salt to taste','Chicken or prawns (optional)'],
    steps:[
      'Wash and drain rice.',
      'In a pot, heat oil, sauté sliced onion until soft.',
      'Add blended tomatoes and peppers. Fry for 8 minutes.',
      'Add coconut milk, water, seasoning, and salt. Bring to a boil.',
      'Add rice. Stir once and cover tightly. Cook on low-medium for 25–30 minutes.',
      'If using protein, stir-fry separately and add in last 5 minutes.',
      'Fluff gently and serve with coleslaw or fried plantain.',
    ]
  },
  {
    id:18, mealId:10, name:'Okra Soup', emoji:'🫑', category:'Soups',
    cookTime:40, servings:5, cost:2500,
    ingredients:['400g fresh okra','300g assorted meat','100g stockfish','3 tbsp palm oil','2 tbsp ground crayfish','2 scotch bonnet peppers','1 onion','2 seasoning cubes','Salt to taste','Periwinkle (optional)'],
    steps:[
      'Cook meat and stockfish with seasoning and onion until tender. Reserve stock.',
      'Wash okra and chop finely or blend roughly (for draw soup texture).',
      'Heat palm oil in a pot. Add blended peppers and fry for 5 minutes.',
      'Add meat, stockfish, crayfish, and enough stock. Bring to a boil.',
      'Add okra and stir vigorously to help the draw. Do not cover pot.',
      'Cook on medium heat for 8–10 minutes, stirring often.',
      'Add periwinkle if using, taste and adjust. Serve with any swallow.',
    ]
  },
  {
    id:19, mealId:7, name:'Tomato Fried Rice', emoji:'🍅', category:'Rice',
    cookTime:35, servings:4, cost:2000,
    ingredients:['3 cups parboiled rice','2 tbsp tomato paste','1 carrot (diced)','100g green beans','1 onion','2 tbsp vegetable oil','1 tsp curry powder','2 seasoning cubes','Salt and pepper to taste'],
    steps:[
      'Par-cook rice until halfway done. Drain and cool.',
      'Heat oil in a pot or wok. Sauté onion until translucent.',
      'Add carrot and green beans. Stir-fry for 3 minutes.',
      'Add tomato paste. Fry for 4–5 minutes until the raw smell is gone.',
      'Add rice and toss to coat with the tomato mixture.',
      'Add curry powder, seasoning, salt. Mix well and cook on medium heat for 8 minutes.',
      'Serve with fried chicken or fish.',
    ]
  },
  {
    id:20, mealId:29, name:'Noodles and Egg', emoji:'🍜', category:'Breakfast',
    cookTime:15, servings:2, cost:600,
    ingredients:['2 packs indomie noodles','2 eggs','1 carrot (sliced)','1 onion','1 pepper','2 tbsp vegetable oil','Salt to taste'],
    steps:[
      'Boil noodles for 2–3 minutes. Do not fully cook. Drain and set aside.',
      'Heat oil in a pan. Sauté onion and pepper for 1 minute.',
      'Add carrot slices. Stir-fry for 2 minutes.',
      'Break eggs into the pan and scramble.',
      'Add drained noodles, seasoning from the packet, and salt.',
      'Toss everything together for 2 minutes on medium heat.',
      'Serve immediately while hot.',
    ]
  },
  {
    id:21, mealId:38, name:'Boli and Groundnut', emoji:'🍌', category:'Snacks',
    cookTime:20, servings:2, cost:600,
    ingredients:['2 ripe plantains','100g roasted groundnut','Salt to taste'],
    steps:[
      'Peel plantains and score lightly with a knife.',
      'Place on a hot grill or directly over medium gas flame.',
      'Turn every 4–5 minutes until all sides are charred and cooked through — about 15–18 minutes total.',
      'Serve hot with roasted groundnut. Optional: sprinkle with salt or serve with pepper sauce.',
    ]
  },
  {
    id:22, mealId:31, name:'Fried Plantain and Egg', emoji:'🍌', category:'Breakfast',
    cookTime:20, servings:2, cost:900,
    ingredients:['2 ripe plantains','3 eggs','1 tomato','1 pepper','1 small onion','2 tbsp vegetable oil','Salt to taste'],
    steps:[
      'Peel plantains and slice diagonally.',
      'Heat 1 tbsp oil in a pan. Fry plantain slices on both sides until golden brown. Set aside.',
      'In the same pan, add remaining oil. Sauté onion and diced tomato and pepper for 2 minutes.',
      'Break in eggs and scramble to desired consistency.',
      'Season with salt. Serve egg sauce alongside fried plantain.',
    ]
  },
  {
    id:23, mealId:25, name:'Amala and Ewedu', emoji:'🌿', category:'Swallows',
    cookTime:30, servings:3, cost:1800,
    ingredients:['2 cups plantain flour (elubo)','3 cups water for amala','300g jute leaves (ewedu)','2 tbsp palm oil','1 tbsp ground crayfish','2 scotch bonnet peppers','Beef stew (gbegiri optional)','Salt, seasoning'],
    steps:[
      'Boil water in a pot. Gradually pour plantain flour while stirring vigorously to avoid lumps.',
      'Keep stirring on low heat for 8–10 minutes until smooth and moldable. Cover to keep warm.',
      'Wash jute leaves, blend or blend using a traditional broom (ijabe) to break down the leaves.',
      'In a small pot, add the blended ewedu, a cup of water, peppers, crayfish, and seasoning.',
      'Cook on medium heat for 10 minutes, stirring regularly. Add palm oil.',
      'Taste and adjust salt. Serve amala with ewedu and beef stew (and gbegiri if available).',
    ]
  },
  {
    id:24, mealId:44, name:'Nkwobi', emoji:'🥩', category:'Delicacies',
    cookTime:90, servings:4, cost:3500,
    ingredients:['1kg cow foot (bokoto)','3 tbsp palm oil','2 tsp potash (kaun) dissolved in 2 tbsp water','100g ugba (oil bean)','Utazi leaves (a handful)','3 scotch bonnet peppers','1 onion','2 tbsp ground crayfish','2 seasoning cubes','Salt to taste'],
    steps:[
      'Clean cow foot thoroughly. Cook with onion, seasoning, and salt for 60–75 minutes until very tender.',
      'Cut into bite-size chunks. Reserve a little stock.',
      'Mix palm oil and potash solution together — it will thicken into an orange-yellow emulsified paste.',
      'Add crayfish, blended peppers, and crumbled seasoning to the palm oil paste. Mix well.',
      'Add cooked cow foot and ugba to the sauce. Toss to coat thoroughly.',
      'Taste and adjust. Transfer to a serving pot.',
      'Chiffonade utazi leaves and scatter over the top. Serve warm with palm wine.',
    ]
  },
  {
    id:25, mealId:11, name:'Banga Soup', emoji:'🌴', category:'Soups',
    cookTime:60, servings:5, cost:3200,
    ingredients:['1 small bunch palm fruits','500g catfish or assorted meat','2 tbsp ground crayfish','2 scotch bonnet peppers','1 onion','Banga spice mix (oruwo, obeletientien, ataiko)','2 seasoning cubes','Bitter leaf (optional)','Salt to taste'],
    steps:[
      'Boil palm fruits for 20 minutes until soft. Pound in a mortar and extract the juice by squeezing with water.',
      'Strain out the chaff. You should have rich palm fruit extract.',
      'Boil the extract in a pot, stirring regularly to prevent burning. Skim froth.',
      'When it reduces and thickens slightly (about 15 minutes), add meat or fish.',
      'Add crayfish, blended peppers, onion, and banga spice mix.',
      'Cook for 15–20 minutes until soup is rich and fragrant. Taste and season.',
      'Optionally add bitter leaf in the last 5 minutes. Serve with starch, eba, or pounded yam.',
    ]
  },
  {
    id:26, mealId:21, name:'Fufu and Okra', emoji:'🍚', category:'Swallows',
    cookTime:30, servings:3, cost:2000,
    ingredients:['Cassava fufu (pre-made or sachet)','400g fresh okra (chopped finely)','300g assorted meat','2 tbsp palm oil','2 tbsp crayfish','Peppers and onion','Seasoning and salt'],
    steps:[
      'Prepare fufu according to package instructions if using sachet, or mold and boil cassava fufu.',
      'Cook meat with seasoning until done.',
      'Heat palm oil, add peppers and onion, fry 5 minutes.',
      'Add meat, crayfish, stock, and seasoning. Bring to a boil.',
      'Add finely chopped okra. Stir and cook 8 minutes uncovered.',
      'Serve with molded fufu.',
    ]
  },
  {
    id:27, mealId:8, name:'Spaghetti Jollof', emoji:'🍝', category:'Rice',
    cookTime:35, servings:4, cost:1800,
    ingredients:['500g spaghetti','4 tomatoes','3 peppers','1 large onion','¼ cup vegetable oil','1 tsp thyme','1 tsp curry powder','2 seasoning cubes','Salt to taste','Chicken (optional)'],
    steps:[
      'Boil spaghetti for 5 minutes (half-cooked). Drain and set aside.',
      'Blend tomatoes, peppers, and half the onion.',
      'Heat oil, fry remaining sliced onion. Add tomato blend and cook 15 minutes until reduced.',
      'Add thyme, curry, seasoning, and a cup of water. Taste.',
      'Add spaghetti. Toss to coat fully. Cook on low heat 10–12 minutes, stirring occasionally.',
      'Serve hot with fried plantain or protein.',
    ]
  },
  {
    id:28, mealId:4, name:'White Rice and Tomato Stew', emoji:'🍲', category:'Rice',
    cookTime:45, servings:4, cost:2000,
    ingredients:['3 cups long grain rice','4 tomatoes','3 peppers','1 large onion','¼ cup vegetable oil','500g chicken or beef','2 seasoning cubes','1 tsp curry','Salt to taste'],
    steps:[
      'Wash and cook rice with salted water until done. Drain and set aside.',
      'Season and fry or grill protein. Set aside.',
      'Blend tomatoes, peppers, and half the onion.',
      'Heat oil, fry sliced onion until golden.',
      'Add tomato blend. Cook on medium heat 20–25 minutes until oil floats.',
      'Add protein and stock. Simmer 10 minutes. Taste.',
      'Serve stew over rice.',
    ]
  },
  {
    id:29, mealId:17, name:'Ogbono Soup', emoji:'🫙', category:'Soups',
    cookTime:45, servings:5, cost:2600,
    ingredients:['1 cup ground ogbono seeds','500g assorted meat','3 tbsp palm oil','2 tbsp crayfish','3 peppers','1 onion','2 seasoning cubes','A handful of spinach or bitter leaf','Salt and water'],
    steps:[
      'Cook assorted meat until tender. Reserve stock.',
      'Heat palm oil in pot on medium heat.',
      'Add ground ogbono directly to the oil. Stir quickly — it will form strings and become fragrant.',
      'Add hot meat stock gradually, stirring constantly to keep it smooth.',
      'Add meat, crayfish, blended peppers, and seasoning. Stir.',
      'Cook on low-medium heat for 15 minutes, stirring regularly.',
      'Add spinach or bitter leaf. Cook 3–5 more minutes. Serve with any swallow.',
    ]
  },
  {
    id:30, mealId:32, name:'Oatmeal Porridge with Banana', emoji:'🥣', category:'Breakfast',
    cookTime:15, servings:2, cost:600,
    ingredients:['2 cups rolled oats','3 cups milk or water','2 ripe bananas','2 tbsp honey or sugar','½ tsp cinnamon','A pinch of nutmeg'],
    steps:[
      'Bring milk (or water) to a gentle boil in a saucepan.',
      'Add oats, stir, and reduce heat to low.',
      'Cook for 5–7 minutes, stirring occasionally, until desired consistency.',
      'Add honey or sugar and cinnamon. Stir.',
      'Slice bananas on top. Sprinkle nutmeg. Serve warm.',
    ]
  },
];

// ─────────────────────────────────────────────
//  NIGERIAN FOOD TIPS
// ─────────────────────────────────────────────
const FOOD_TIPS = [
  '💧 Parboil rice before making Jollof — this helps it cook evenly and gives that "party rice" texture.',
  '🧅 Always fry your tomato stew long enough that the oil separates and floats — this is how you know it\'s cooked.',
  '🌿 Add your leafy vegetables (efo, bitter leaf, uziza) last to preserve colour, nutrients, and flavour.',
  '💰 Buy tomatoes and peppers in season — they\'re cheaper and tastier. Blend and freeze in batches to save money.',
  '🐟 Stockfish adds deep flavour to soups at a lower cost than fresh fish. Soak overnight before cooking.',
  '🫑 Chopping okra very finely and adding it to hot soup gives the "draw" texture without blending.',
  '🌴 Palm oil is best added after the stew base has cooked — this preserves its nutritional benefits.',
  '🍌 For the sweetest fried plantain, use very ripe plantain with dark patches on the skin.',
  '🧆 When making akara, whisk the bean batter vigorously for 5 minutes before frying — it creates air for a fluffy result.',
  '📦 Buying seasonings (curry, thyme, bay leaves) in bulk from the market is 40% cheaper than buying sachets.',
  '🫘 Soaking beans for 2 hours before cooking reduces cooking time and gas-causing compounds.',
  '🔥 For smoky Jollof Rice (party-style), crank up the heat in the last 5 minutes — let it catch slightly at the bottom.',
  '🍳 Save leftover vegetable oil from frying plantain — it\'s flavoured and perfect for next day\'s stew.',
  '💡 Bulk-buy dried crayfish at the market and store in a glass jar. It lasts months and is much cheaper.',
  '🌽 Corn for pap is cheapest when bought at milling shops — you pay only for what you grind.',
  '🍠 Yam stores well at room temperature for weeks. Only refrigerate once cut.',
  '🥚 Eggs are one of the most affordable sources of complete protein in Nigeria. Keep them in your weekly budget.',
  '🛒 Plan meals on Sunday, shop on Monday when markets are less crowded and produce is freshest.',
  '🍲 A pot of Egusi or Ogbono made in bulk lasts 3–4 days in the fridge — cook once, eat thrice.',
  '🌶️ Scotch bonnet peppers freeze beautifully whole. Buy in bulk during low prices and freeze for months.',
];

// ─────────────────────────────────────────────
//  INGREDIENT → CATEGORY MAP (for shopping list)
// ─────────────────────────────────────────────
const INGREDIENT_CATS = {
  Proteins: ['chicken','beef','goat meat','fish','catfish','shrimp','eggs','stockfish','smoked fish','assorted meat','ponmo','tripe','cow foot','periwinkle','crayfish','dried crayfish'],
  Vegetables: ['tomatoes','peppers','onion','scotch bonnet','spinach','bitter leaf','okra','carrot','green beans','garden egg','ugwu','efo','waterleaf','afang leaves','jute leaves','utazi','uziza','ugba','ewedu'],
  Grains: ['rice','spaghetti','noodles','beans','garri','fufu','yam','plantain','wheat meal','semovita','flour','oats','corn powder','abacha','cassava'],
  Seasonings: ['salt','seasoning cubes','maggi','curry powder','thyme','bay leaf','pepper soup spice','yaji','banga spice','potash','locust beans','nutmeg','cinnamon'],
  Oils: ['palm oil','vegetable oil','coconut milk','butter'],
  Others: ['water','sugar','milk','groundnut','coconut','honey','soy sauce','tomato paste','yeast'],
};

// ─────────────────────────────────────────────
//  DAYS / MEAL TIMES
// ─────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TIMES = ['breakfast','lunch','dinner'];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let state = {
  plan: {}, // { "Monday": { breakfast: null, lunch: null, dinner: null }, ... }
  favourites: new Set(),
  expenses: [],
  monthlyBudgetGoal: 0,
  darkMode: false,
  tipIndex: 0,
  recentRecipes: [],
};

// ─────────────────────────────────────────────
//  LOCAL STORAGE
// ─────────────────────────────────────────────
function saveState() {
  const toSave = {
    plan: state.plan,
    favourites: [...state.favourites],
    expenses: state.expenses,
    monthlyBudgetGoal: state.monthlyBudgetGoal,
    darkMode: state.darkMode,
    tipIndex: state.tipIndex,
    recentRecipes: state.recentRecipes,
  };
  localStorage.setItem('mealpilot', JSON.stringify(toSave));
}

function loadState() {
  const raw = localStorage.getItem('mealpilot');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state.plan = saved.plan || {};
    state.favourites = new Set(saved.favourites || []);
    state.expenses = saved.expenses || [];
    state.monthlyBudgetGoal = saved.monthlyBudgetGoal || 0;
    state.darkMode = saved.darkMode || false;
    state.tipIndex = saved.tipIndex || 0;
    state.recentRecipes = saved.recentRecipes || [];
  } catch(e) { /* corrupted, ignore */ }
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }

function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.add('hidden'), 2800);
}

function openModal(html) {
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function openShoppingModal(html) {
  document.getElementById('shoppingBody').innerHTML = html;
  document.getElementById('shoppingOverlay').classList.remove('hidden');
}

function closeShoppingModal() {
  document.getElementById('shoppingOverlay').classList.add('hidden');
}

function getMealById(id) { return MEALS.find(m => m.id === id); }

function normalizeIngredient(s) { return s.trim().toLowerCase(); }

function categorizeIngredient(ing) {
  const n = normalizeIngredient(ing);
  for (const [cat, list] of Object.entries(INGREDIENT_CATS)) {
    if (list.some(i => n.includes(i) || i.includes(n))) return cat;
  }
  return 'Others';
}

// ─────────────────────────────────────────────
//  PLANNER
// ─────────────────────────────────────────────
function initPlan() {
  DAYS.forEach(day => {
    if (!state.plan[day]) {
      state.plan[day] = { breakfast: null, lunch: null, dinner: null };
    }
  });
}

function renderPlanner() {
  const grid = document.getElementById('plannerGrid');
  const today = new Date().toLocaleDateString('en-NG', { weekday:'long' });

  grid.innerHTML = DAYS.map(day => {
    const dayPlan = state.plan[day] || {};
    const isToday = day === today;

    const rows = MEAL_TIMES.map(time => {
      const mealId = dayPlan[time];
      const meal = mealId ? getMealById(mealId) : null;
      const filled = !!meal;
      return `
        <div class="planner-meal-row">
          <span class="meal-time-label ${time}">${time}</span>
          <div class="meal-slot ${filled ? 'filled' : ''}" data-day="${day}" data-time="${time}">
            ${filled
              ? `<span>${meal.emoji} ${meal.name}</span><button class="meal-slot-clear" data-day="${day}" data-time="${time}">✕</button>`
              : `<span style="color:var(--text-muted);font-size:0.82rem">+ Add meal</span>`
            }
          </div>
        </div>`;
    }).join('');

    return `
      <div class="planner-day" ${isToday ? 'style="border-color:var(--orange);box-shadow:0 0 0 2px var(--orange)20"' : ''}>
        <div class="planner-day-header" ${isToday ? 'style="background:var(--orange-dark)"' : ''}>
          <span class="planner-day-name">${day} ${isToday ? '📍' : ''}</span>
          <span class="planner-day-date">${isToday ? 'Today' : ''}</span>
        </div>
        <div class="planner-meals">${rows}</div>
      </div>`;
  }).join('');

  // Slot click
  grid.querySelectorAll('.meal-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target.classList.contains('meal-slot-clear')) return;
      openMealPicker(slot.dataset.day, slot.dataset.time);
    });
  });

  // Clear buttons
  grid.querySelectorAll('.meal-slot-clear').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.plan[btn.dataset.day][btn.dataset.time] = null;
      saveState();
      renderPlanner();
    });
  });
}

function openMealPicker(day, time) {
  const html = `
    <div class="modal-meal-header">
      <div class="modal-meal-name" style="font-size:1.1rem">Choose a meal for ${day} ${time}</div>
    </div>
    <div class="search-bar">
      <input type="text" id="mealPickerSearch" placeholder="Search meals…" style="margin:0" />
      <span class="search-icon">🔍</span>
    </div>
    <div class="custom-meal-input">
      <label>Or type a custom meal name:</label>
      <div style="display:flex;gap:8px">
        <input type="text" id="customMealName" placeholder="e.g. Semolina and Okazi" />
        <button class="btn btn-sm btn-primary" id="addCustomMealBtn">Add</button>
      </div>
    </div>
    <div class="meal-picker-grid" id="mealPickerGrid">${renderPickerGrid(MEALS)}</div>`;

  openModal(html);

  // Search
  document.getElementById('mealPickerSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = q ? MEALS.filter(m => m.name.toLowerCase().includes(q)) : MEALS;
    document.getElementById('mealPickerGrid').innerHTML = renderPickerGrid(filtered);
    bindPickerItems(day, time);
  });

  // Custom meal
  document.getElementById('addCustomMealBtn').addEventListener('click', () => {
    const name = document.getElementById('customMealName').value.trim();
    if (!name) return;
    // Create a temporary custom meal object
    const customId = 'custom_' + Date.now();
    state.plan[day][time] = customId;
    // Store custom meal in localStorage
    const customs = JSON.parse(localStorage.getItem('mp_customs') || '{}');
    customs[customId] = { id: customId, name, emoji: '🍽️', category: 'Custom', cost: 0, ingredients: [] };
    localStorage.setItem('mp_customs', JSON.stringify(customs));
    saveState();
    closeModal();
    renderPlanner();
    showToast(`${name} added to ${day} ${time}`, 'success');
  });

  bindPickerItems(day, time);
}

function renderPickerGrid(meals) {
  return meals.map(m => `
    <div class="meal-picker-item" data-id="${m.id}">
      <div class="meal-picker-emoji">${m.emoji}</div>
      <div class="meal-picker-name">${m.name}</div>
      <div class="meal-picker-cost">${fmt(m.cost)}/serving</div>
    </div>`).join('');
}

function bindPickerItems(day, time) {
  document.querySelectorAll('.meal-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      state.plan[day][time] = Number(item.dataset.id);
      saveState();
      closeModal();
      renderPlanner();
      showToast('Meal added! ✓', 'success');
    });
  });
}

// custom meal lookup
function getAnyMealById(id) {
  if (typeof id === 'string' && id.startsWith('custom_')) {
    const customs = JSON.parse(localStorage.getItem('mp_customs') || '{}');
    return customs[id];
  }
  return getMealById(id);
}

// ─────────────────────────────────────────────
//  SHOPPING LIST GENERATOR
// ─────────────────────────────────────────────
function generateShoppingList() {
  const allIngredients = [];

  DAYS.forEach(day => {
    const dayPlan = state.plan[day] || {};
    MEAL_TIMES.forEach(time => {
      const mealId = dayPlan[time];
      if (!mealId) return;
      const meal = getAnyMealById(mealId);
      if (meal && meal.ingredients) {
        meal.ingredients.forEach(ing => allIngredients.push(normalizeIngredient(ing)));
      }
    });
  });

  if (allIngredients.length === 0) {
    showToast('Plan some meals first!');
    return;
  }

  // Count & deduplicate
  const counts = {};
  allIngredients.forEach(ing => { counts[ing] = (counts[ing] || 0) + 1; });

  // Group by category
  const grouped = {};
  Object.keys(INGREDIENT_CATS).forEach(cat => grouped[cat] = []);

  Object.entries(counts).forEach(([ing, count]) => {
    const cat = categorizeIngredient(ing);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ ing, count });
  });

  // Build HTML
  let listsHTML = '';
  let listText = '🛒 SHOPPING LIST — MealPilot\n\n';

  Object.entries(grouped).forEach(([cat, items]) => {
    if (!items.length) return;
    listsHTML += `<div class="shopping-group"><h4>${cat}</h4>`;
    listText += `── ${cat} ──\n`;
    items.forEach(({ ing, count }) => {
      const label = count > 1 ? `${capitalize(ing)} ×${count}` : capitalize(ing);
      listsHTML += `
        <div class="shopping-item" id="si_${ing.replace(/\s/g,'_')}">
          <input type="checkbox" id="chk_${ing.replace(/\s/g,'_')}" onchange="toggleShoppingItem(this)" />
          <label for="chk_${ing.replace(/\s/g,'_')}">${label}</label>
        </div>`;
      listText += `☐ ${label}\n`;
    });
    listsHTML += `</div>`;
    listText += '\n';
  });

  const totalMeals = Object.values(state.plan).flatMap(d => Object.values(d)).filter(Boolean).length;

  const html = `
    <div class="shopping-header">
      <h3>🛒 Shopping List</h3>
      <div class="shopping-actions">
        <button class="btn btn-sm btn-outline" onclick="printShoppingList()">🖨️</button>
        <button class="btn btn-sm btn-primary" onclick="copyShoppingList('${encodeURIComponent(listText)}')">📋 Copy</button>
        <button class="btn btn-sm btn-orange" onclick="downloadShoppingList('${encodeURIComponent(listText)}')">⬇️</button>
      </div>
    </div>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px">${totalMeals} meals planned · ${Object.values(counts).length} ingredients</p>
    ${listsHTML}`;

  openShoppingModal(html);
}

function toggleShoppingItem(checkbox) {
  const item = checkbox.closest('.shopping-item');
  item.classList.toggle('checked', checkbox.checked);
}

function printShoppingList() {
  window.print();
}

function copyShoppingList(encoded) {
  const text = decodeURIComponent(encoded);
  navigator.clipboard.writeText(text).then(() => showToast('Copied!', 'success'));
}

function downloadShoppingList(encoded) {
  const text = decodeURIComponent(encoded);
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mealpilot-shopping-list.txt';
  a.click();
  showToast('Downloaded!', 'success');
}

// ─────────────────────────────────────────────
//  MEAL CARDS (Explore Section)
// ─────────────────────────────────────────────
function renderMealCards(meals) {
  const grid = document.getElementById('mealCardsGrid');
  if (!meals.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No meals found. Try a different search.</p></div>`;
    return;
  }
  grid.innerHTML = meals.map(m => `
    <div class="meal-card" data-id="${m.id}">
      <button class="meal-fav-btn ${state.favourites.has(m.id) ? 'active' : ''}" data-id="${m.id}">⭐</button>
      <span class="meal-emoji">${m.emoji}</span>
      <div class="meal-name">${m.name}</div>
      <div class="meal-category">${m.category}</div>
      <div class="meal-cost">${fmt(m.cost)} for ${m.servings} servings</div>
    </div>`).join('');

  grid.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('meal-fav-btn')) return;
      openMealDetail(Number(card.dataset.id));
    });
  });

  grid.querySelectorAll('.meal-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFav(Number(btn.dataset.id));
      btn.classList.toggle('active');
    });
  });
}

function filterMealCards() {
  const q = document.getElementById('mealSearchInput').value.toLowerCase();
  const activeChip = document.querySelector('#mealCategoryFilter .chip.active');
  const cat = activeChip ? activeChip.dataset.cat : 'all';
  let meals = MEALS;
  if (cat !== 'all') meals = meals.filter(m => m.category === cat);
  if (q) meals = meals.filter(m => m.name.toLowerCase().includes(q));
  renderMealCards(meals);
}

// ─────────────────────────────────────────────
//  MEAL DETAIL MODAL
// ─────────────────────────────────────────────
function openMealDetail(id) {
  const meal = getMealById(id);
  if (!meal) return;

  const recipe = RECIPES.find(r => r.mealId === id);
  const isFav = state.favourites.has(id);

  let addToPlanHTML = `
    <div class="modal-section">
      <h4>Add to Meal Plan</h4>
      <select class="meal-add-to-day-select" id="addToDaySelect">
        ${DAYS.map(d => MEAL_TIMES.map(t =>
          `<option value="${d}|${t}">${d} — ${capitalize(t)}</option>`
        ).join('')).join('')}
      </select>
      <button class="btn btn-primary btn-sm" id="addToPlanConfirmBtn">Add to Plan</button>
    </div>`;

  const stepsHTML = recipe
    ? `<div class="modal-section"><h4>Method (${recipe.cookTime} min)</h4><ol class="modal-step-list">${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>`
    : '';

  const html = `
    <div class="modal-meal-header">
      <div class="modal-meal-emoji">${meal.emoji}</div>
      <div class="modal-meal-name">${meal.name}</div>
      <div class="modal-tags">
        <span class="modal-tag tag-green">${meal.category}</span>
        <span class="modal-tag tag-orange">${fmt(meal.cost)} / ${meal.servings} servings</span>
        <span class="modal-tag tag-purple">${fmt(Math.round(meal.cost / meal.servings))} per person</span>
      </div>
    </div>
    <div class="modal-section">
      <h4>Basic Ingredients</h4>
      <ul class="modal-ingredient-list">${meal.ingredients.map(i => `<li>${capitalize(i)}</li>`).join('')}</ul>
    </div>
    ${stepsHTML}
    ${addToPlanHTML}
    <div class="modal-actions">
      <button class="btn btn-sm ${isFav ? 'btn-orange' : 'btn-outline'}" id="favToggleBtn">
        ${isFav ? '⭐ Saved' : '☆ Save'}
      </button>
    </div>`;

  openModal(html);

  document.getElementById('addToPlanConfirmBtn').addEventListener('click', () => {
    const [day, time] = document.getElementById('addToDaySelect').value.split('|');
    state.plan[day][time] = id;
    saveState();
    closeModal();
    renderPlanner();
    showToast(`Added to ${day} ${time}!`, 'success');
  });

  document.getElementById('favToggleBtn').addEventListener('click', () => {
    toggleFav(id);
    const isFavNow = state.favourites.has(id);
    document.getElementById('favToggleBtn').textContent = isFavNow ? '⭐ Saved' : '☆ Save';
    document.getElementById('favToggleBtn').className = `btn btn-sm ${isFavNow ? 'btn-orange' : 'btn-outline'}`;
  });

  // Track recently viewed
  state.recentRecipes = [id, ...state.recentRecipes.filter(x => x !== id)].slice(0, 5);
  saveState();
}

// ─────────────────────────────────────────────
//  RECIPES SECTION
// ─────────────────────────────────────────────
function renderRecipeCards(recipes) {
  const grid = document.getElementById('recipeCardsGrid');
  if (!recipes.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📖</div><p>No recipes found.</p></div>`;
    return;
  }
  grid.innerHTML = recipes.map(r => `
    <div class="recipe-card" data-id="${r.mealId}">
      <span class="recipe-emoji">${r.emoji}</span>
      <div class="recipe-name">${r.name}</div>
      <div class="recipe-meta">
        <span class="recipe-tag green">${r.category}</span>
        <span class="recipe-tag orange">⏱ ${r.cookTime}min</span>
        <span class="recipe-tag">${fmt(r.cost)}</span>
        <span class="recipe-tag">👥 ${r.servings}</span>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => openMealDetail(Number(card.dataset.id)));
  });
}

function filterRecipeCards() {
  const q = document.getElementById('recipeSearchInput').value.toLowerCase();
  const activeChip = document.querySelector('#recipeCategoryFilter .chip.active');
  const cat = activeChip ? activeChip.dataset.cat : 'all';
  let recipes = RECIPES;
  if (cat !== 'all') recipes = recipes.filter(r => r.category === cat);
  if (q) recipes = recipes.filter(r => r.name.toLowerCase().includes(q));
  renderRecipeCards(recipes);
}

// ─────────────────────────────────────────────
//  BUDGET: WHAT CAN I COOK?
// ─────────────────────────────────────────────
function runBudgetSuggest() {
  const budget = Number(document.getElementById('budgetInput').value);
  if (!budget || budget < 100) {
    showToast('Please enter a valid amount (min ₦100)');
    return;
  }

  const affordable = MEALS.filter(m => m.cost <= budget * 1.15); // allow 15% over (can scale servings)

  if (!affordable.length) {
    document.getElementById('budgetResults').innerHTML = `<p style="color:rgba(255,255,255,0.8);text-align:center;padding:16px">Hmm, ₦${budget} is very tight. Try ₦500 or more.</p>`;
    document.getElementById('budgetResults').classList.remove('hidden');
    return;
  }

  // Sort by closest to budget
  const sorted = affordable.sort((a, b) => {
    const diffA = Math.abs(budget - a.cost);
    const diffB = Math.abs(budget - b.cost);
    return diffA - diffB;
  }).slice(0, 6);

  const html = `
    <p style="color:rgba(255,255,255,0.9);font-size:0.82rem;margin-bottom:12px">
      🎉 ${affordable.length} meals within your ${fmt(budget)} budget:
    </p>
    ${sorted.map(m => `
      <div class="budget-meal-item">
        <div class="meal-n">${m.emoji} ${m.name}</div>
        <div class="meal-d">${m.ingredients.slice(0,4).join(', ')}…</div>
        <div class="meal-c">${fmt(m.cost)} · ${m.servings} servings · ${fmt(Math.round(m.cost/m.servings))} p/person</div>
      </div>`).join('')}
    ${affordable.length > 6 ? `<p style="color:rgba(255,255,255,0.7);font-size:0.78rem;text-align:center;margin-top:8px">+${affordable.length-6} more meals available</p>` : ''}`;

  document.getElementById('budgetResults').innerHTML = html;
  document.getElementById('budgetResults').classList.remove('hidden');
}

// ─────────────────────────────────────────────
//  BUDGET ESTIMATOR
// ─────────────────────────────────────────────
function runBudgetEstimate() {
  const adults = Number(document.getElementById('numAdults').value) || 1;
  const children = Number(document.getElementById('numChildren').value) || 0;
  const days = Number(document.getElementById('numDays').value) || 7;

  // Nigerian price assumptions (2024 estimates, Naira)
  const DAILY_PER_ADULT = { economy: 1200, standard: 2000, premium: 3500 };
  const DAILY_PER_CHILD = { economy: 700, standard: 1200, premium: 2000 };

  const tiers = ['economy', 'standard', 'premium'];
  const labels = { economy: '💚 Budget-Friendly', standard: '🟡 Standard', premium: '💜 Premium' };

  const results = tiers.map(tier => {
    const daily = (adults * DAILY_PER_ADULT[tier]) + (children * DAILY_PER_CHILD[tier]);
    const total = daily * days;
    const weekly = daily * 7;
    return { tier, label: labels[tier], daily, total, weekly };
  });

  const html = `
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px">
      For ${adults} adult${adults>1?'s':''} + ${children} child${children!==1?'ren':''}, ${days} days:
    </p>
    ${results.map(r => `
      <div class="budget-tier ${r.tier}">
        <div>
          <div class="budget-tier-label">${r.label}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">Daily: ${fmt(r.daily)} · Weekly: ${fmt(r.weekly)}</div>
        </div>
        <div class="budget-tier-amount">${fmt(r.total)}</div>
      </div>`).join('')}
    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:10px">* Based on current Nigerian market prices. Actual costs vary by location and season.</p>`;

  document.getElementById('budgetEstimateResults').innerHTML = html;
  document.getElementById('budgetEstimateResults').classList.remove('hidden');
}

// ─────────────────────────────────────────────
//  INGREDIENT MATCHING
// ─────────────────────────────────────────────
function runIngredientMatch() {
  const raw = document.getElementById('ingredientInput').value;
  if (!raw.trim()) { showToast('Enter some ingredients first'); return; }

  const userIngs = raw.split(',').map(s => normalizeIngredient(s)).filter(Boolean);

  const scored = MEALS.map(meal => {
    const mealIngs = meal.ingredients.map(normalizeIngredient);
    const matches = mealIngs.filter(mi => userIngs.some(ui => mi.includes(ui) || ui.includes(mi)));
    const pct = Math.round((matches.length / mealIngs.length) * 100);
    const missing = mealIngs.filter(mi => !userIngs.some(ui => mi.includes(ui) || ui.includes(mi)));
    return { meal, pct, matches, missing };
  }).filter(s => s.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  if (!scored.length) {
    document.getElementById('ingredientResults').innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px">No matching meals found. Try more ingredients!</p>`;
    document.getElementById('ingredientResults').classList.remove('hidden');
    return;
  }

  const html = scored.map(s => {
    const pctClass = s.pct >= 70 ? 'high' : s.pct >= 40 ? 'mid' : 'low';
    return `
      <div class="ingredient-match">
        <div class="match-header">
          <span class="match-name">${s.meal.emoji} ${s.meal.name}</span>
          <span class="match-pct ${pctClass}">${s.pct}% match</span>
        </div>
        <div class="match-detail">
          <span>✓ You have: ${s.matches.slice(0,4).map(capitalize).join(', ')}${s.matches.length > 4 ? '…' : ''}</span>
          ${s.missing.length ? `<span style="color:var(--orange-dark)">✗ You need: ${s.missing.slice(0,3).map(capitalize).join(', ')}${s.missing.length > 3 ? ` +${s.missing.length-3} more` : ''}</span>` : '<span style="color:var(--green)">🎉 You have everything!</span>'}
        </div>
      </div>`;
  }).join('');

  document.getElementById('ingredientResults').innerHTML = html;
  document.getElementById('ingredientResults').classList.remove('hidden');
}

// ─────────────────────────────────────────────
//  TRACKER
// ─────────────────────────────────────────────
function renderTracker() {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekSpend = state.expenses.filter(e => new Date(e.date) >= thisWeekStart).reduce((s, e) => s + e.amount, 0);
  const monthSpend = state.expenses.filter(e => new Date(e.date) >= thisMonthStart).reduce((s, e) => s + e.amount, 0);
  const goal = state.monthlyBudgetGoal;

  const remaining = goal ? Math.max(0, goal - monthSpend) : 0;
  const pct = goal ? Math.min(100, Math.round((monthSpend / goal) * 100)) : 0;
  const pctClass = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : '';

  document.getElementById('trackerSummary').innerHTML = `
    <div class="tracker-stat">
      <span class="amount">${fmt(weekSpend)}</span>
      <span class="label">This week</span>
    </div>
    <div class="tracker-stat">
      <span class="amount">${fmt(monthSpend)}</span>
      <span class="label">This month</span>
    </div>
    ${goal ? `
    <div class="tracker-stat" style="grid-column:1/-1">
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Monthly budget</span>
          <span>${pct}% used · ${fmt(remaining)} left</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${pctClass}" style="width:${pct}%"></div>
        </div>
      </div>
    </div>` : ''}`;

  // Update budget goal input
  if (goal) document.getElementById('monthlyBudgetGoal').value = goal;

  // Chart (mini bar chart by category)
  renderMiniChart();

  // Expense list
  const list = document.getElementById('expenseList');
  const recent = [...state.expenses].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  if (!recent.length) {
    list.innerHTML = `<div class="empty-state" style="padding:20px"><div class="empty-icon">💸</div><p>No expenses yet. Add your first one!</p></div>`;
    return;
  }
  list.innerHTML = recent.map(e => `
    <div class="expense-item">
      <div>
        <div class="expense-desc">${e.desc}</div>
        <div class="expense-cat">${e.category} · ${new Date(e.date).toLocaleDateString('en-NG')}</div>
      </div>
      <div style="display:flex;align-items:center">
        <span class="expense-amount">${fmt(e.amount)}</span>
        <button class="expense-delete" data-id="${e.id}">🗑</button>
      </div>
    </div>`).join('');

  list.querySelectorAll('.expense-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      state.expenses = state.expenses.filter(e => e.id !== Number(btn.dataset.id));
      saveState();
      renderTracker();
    });
  });
}

function renderMiniChart() {
  const cats = Object.keys(INGREDIENT_CATS);
  const catTotals = {};
  cats.forEach(c => catTotals[c] = 0);

  state.expenses.forEach(e => {
    if (catTotals[e.category] !== undefined) {
      catTotals[e.category] += e.amount;
    } else {
      catTotals['Others'] = (catTotals['Others'] || 0) + e.amount;
    }
  });

  const maxVal = Math.max(...Object.values(catTotals), 1);
  const chartEl = document.getElementById('spendingChart');
  // Use a div-based mini chart instead of canvas
  chartEl.outerHTML; // no-op, just ensure it exists
  const container = chartEl.parentElement;
  // Replace canvas with div chart
  const existing = container.querySelector('.mini-chart');
  if (existing) existing.remove();

  const miniChart = document.createElement('div');
  miniChart.className = 'mini-chart';

  const entries = Object.entries(catTotals).filter(([,v]) => v > 0);
  if (!entries.length) {
    miniChart.innerHTML = `<p style="color:var(--text-muted);font-size:0.82rem;text-align:center;padding:10px">No spending data yet</p>`;
  } else {
    miniChart.innerHTML = entries.map(([cat, val]) => `
      <div class="mini-bar-row">
        <span class="mini-bar-label">${cat}</span>
        <div class="mini-bar-track">
          <div class="mini-bar-fill" style="width:${Math.round((val/maxVal)*100)}%"></div>
        </div>
        <span class="mini-bar-val">${fmt(val)}</span>
      </div>`).join('');
  }

  container.insertBefore(miniChart, document.getElementById('expenseList'));
}

function addExpense() {
  const desc = document.getElementById('expenseDesc').value.trim();
  const amount = Number(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const budgetGoal = Number(document.getElementById('monthlyBudgetGoal').value);

  if (!desc || !amount || amount <= 0) {
    showToast('Please fill in description and amount');
    return;
  }

  state.expenses.push({ id: Date.now(), desc, amount, category, date: new Date().toISOString() });
  if (budgetGoal > 0) state.monthlyBudgetGoal = budgetGoal;

  document.getElementById('expenseDesc').value = '';
  document.getElementById('expenseAmount').value = '';

  saveState();
  renderTracker();
  showToast('Expense added!', 'success');
}

// ─────────────────────────────────────────────
//  FOOD TIPS
// ─────────────────────────────────────────────
function renderTip() {
  const tip = FOOD_TIPS[state.tipIndex % FOOD_TIPS.length];
  document.getElementById('foodTipDisplay').innerHTML = `
    <div class="tip-number">Tip ${state.tipIndex % FOOD_TIPS.length + 1} of ${FOOD_TIPS.length}</div>
    <div class="tip-text">${tip}</div>`;
}

// ─────────────────────────────────────────────
//  FAVOURITES
// ─────────────────────────────────────────────
function toggleFav(id) {
  if (state.favourites.has(id)) {
    state.favourites.delete(id);
    showToast('Removed from favourites');
  } else {
    state.favourites.add(id);
    showToast('Saved to favourites ⭐', 'success');
  }
  saveState();
}

function openFavourites() {
  const favIds = [...state.favourites];
  if (!favIds.length) {
    openModal(`<div class="modal-meal-header"><div class="modal-meal-name">⭐ Favourites</div></div><div class="empty-state"><div class="empty-icon">⭐</div><p>No favourites yet! Tap the star on any meal to save it here.</p></div>`);
    return;
  }
  const meals = favIds.map(id => getMealById(id)).filter(Boolean);
  const html = `
    <div class="modal-meal-header"><div class="modal-meal-name">⭐ Favourites (${meals.length})</div></div>
    <div class="fav-list">${meals.map(m => `
      <div class="fav-item" data-id="${m.id}">
        <span class="fav-emoji">${m.emoji}</span>
        <div>
          <div class="fav-name">${m.name}</div>
          <div class="fav-cat">${m.category} · ${fmt(m.cost)}</div>
        </div>
      </div>`).join('')}
    </div>`;
  openModal(html);
  document.querySelectorAll('.fav-item').forEach(item => {
    item.addEventListener('click', () => {
      closeModal();
      setTimeout(() => openMealDetail(Number(item.dataset.id)), 200);
    });
  });
}

// ─────────────────────────────────────────────
//  EXPORT PLAN
// ─────────────────────────────────────────────
function exportPlan() {
  let text = '📅 MY WEEKLY MEAL PLAN — MealPilot\n';
  text += `Generated: ${new Date().toLocaleDateString('en-NG')}\n\n`;
  let totalCost = 0;

  DAYS.forEach(day => {
    text += `── ${day.toUpperCase()} ──\n`;
    const dayPlan = state.plan[day] || {};
    MEAL_TIMES.forEach(time => {
      const mealId = dayPlan[time];
      const meal = mealId ? getAnyMealById(mealId) : null;
      text += `  ${capitalize(time)}: ${meal ? `${meal.name} (${fmt(meal.cost)})` : 'Not planned'}\n`;
      if (meal) totalCost += meal.cost;
    });
    text += '\n';
  });

  text += `──────────────────────\n`;
  text += `Estimated Total: ${fmt(totalCost)}\n`;
  text += `\nPlanned with MealPilot 🍛`;

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mealpilot-plan-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  showToast('Plan exported!', 'success');
}

// ─────────────────────────────────────────────
//  DARK MODE
// ─────────────────────────────────────────────
function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark-mode', state.darkMode);
  document.getElementById('darkModeToggle').innerHTML = state.darkMode ? '<span>☀️</span>' : '<span class="icon-moon">🌙</span>';
  saveState();
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function navigate(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById('sec-' + sectionId);
  const navBtn = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

  if (section) section.classList.add('active');
  if (navBtn) navBtn.classList.add('active');

  // Refresh content per section
  if (sectionId === 'planner') renderPlanner();
  if (sectionId === 'explore') filterMealCards();
  if (sectionId === 'recipes') filterRecipeCards();
  if (sectionId === 'tracker') renderTracker();

  window.scrollTo(0, 0);
}

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
function init() {
  loadState();
  initPlan();

  // Splash
  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
    document.getElementById('app').classList.remove('hidden');
    renderPlanner();
    renderMealCards(MEALS);
    renderRecipeCards(RECIPES);
    renderTracker();
    renderTip();
  }, 1600);

  // Apply dark mode
  if (state.darkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').innerHTML = '<span>☀️</span>';
  }

  // NAV
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.section));
  });

  // HEADER BUTTONS
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  document.getElementById('favBtn').addEventListener('click', openFavourites);

  // PLANNER ACTIONS
  document.getElementById('generateShoppingList').addEventListener('click', generateShoppingList);
  document.getElementById('exportPlanBtn').addEventListener('click', exportPlan);
  document.getElementById('clearPlanBtn').addEventListener('click', () => {
    if (!confirm('Clear the entire week\'s meal plan?')) return;
    DAYS.forEach(d => { state.plan[d] = { breakfast: null, lunch: null, dinner: null }; });
    saveState();
    renderPlanner();
    showToast('Plan cleared');
  });

  // MEAL EXPLORE FILTERS
  document.getElementById('mealSearchInput').addEventListener('input', filterMealCards);
  document.querySelectorAll('#mealCategoryFilter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#mealCategoryFilter .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterMealCards();
    });
  });

  // RECIPE FILTERS
  document.getElementById('recipeSearchInput').addEventListener('input', filterRecipeCards);
  document.querySelectorAll('#recipeCategoryFilter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#recipeCategoryFilter .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterRecipeCards();
    });
  });

  // BUDGET FEATURES
  document.getElementById('budgetSuggestBtn').addEventListener('click', runBudgetSuggest);
  document.getElementById('budgetInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') runBudgetSuggest(); });
  document.getElementById('estimateBudgetBtn').addEventListener('click', runBudgetEstimate);
  document.getElementById('ingredientMatchBtn').addEventListener('click', runIngredientMatch);

  // TRACKER
  document.getElementById('addExpenseBtn').addEventListener('click', addExpense);

  // TIPS
  document.getElementById('nextTipBtn').addEventListener('click', () => {
    state.tipIndex++;
    saveState();
    renderTip();
  });

  // MODALS
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('shoppingClose').addEventListener('click', closeShoppingModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.getElementById('shoppingOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('shoppingOverlay')) closeShoppingModal();
  });
}

// Expose functions needed by inline handlers
window.toggleShoppingItem = toggleShoppingItem;
window.printShoppingList = printShoppingList;
window.copyShoppingList = copyShoppingList;
window.downloadShoppingList = downloadShoppingList;

document.addEventListener('DOMContentLoaded', init);
