import json
import os
import re
import requests
import time

# import Quests from ../quests/quests.py
import quests

        
# Initialize the path to the JSON file
script_dir = os.path.dirname(__file__)
data_path = os.path.join(script_dir, '..', 'data', 'MoonbouncePlus.json')
marketplace_data_path = os.path.join(script_dir, '..', 'data', 'marketplace.json')
quests_data_path = os.path.join(script_dir, '..', 'data', 'quests.json')

recipes_enabled = True
usages_enabled = True
timeout = 10

#region Classes
class Item:
    """A class to represent an item in Moonbounce.
    
    Attributes:
        id : int
            The unique identifier of the item.
        name : str
            The name of the item.
        description : str
            The description of the item.
        type : str
            The type of the item.
        value : int
            The value of the item.
        rarity : str
            The rarity of the item.
        sources : list
            A list of sources where the item can be found.
        uuid : str
            The UUID of the item's image.
    """
    
    def __init__(self, id, name, description, type, value, rarity, sources, uuid=None):
        self.id = id
        self.name = name
        self.description = description
        self.type = type.lower().capitalize()
        self.value = value
        self.rarity = rarity.lower().capitalize()
        self.sources = sources
        self.uuid = uuid
        
        self.promo = False
        self.trivia = []
        self.categories = None
        
        self.gallery = []
        self.appearance = None
        
        self.name_formatted = format_name(name)
        
    def __str__(self):
        return f'# {self.id} - {self.name} [{self.type}] [{self.rarity}]'
    
class Recipe:
    """A class to represent a recipe in Moonbounce.
    
    Attributes
        result : str
            The name of the item that the recipe creates.
        ingredients : list
            A list of ingredients required for the recipe.
        tools : list
            A list of tools required for the recipe.
        type : str
            The type of the recipe. (Seasonal, Event, etc.)
    """
    def __init__(self, result, ingredients, tools, type):
        self.result = result
        self.ingredients = ingredients
        self.tools = tools
        self.type = type
        
    def __str__(self):
        inputs = self.ingredients + self.tools
        
        return f'# {self.id} - {self.result} [{"+".join(inputs)}]'

class Source:
    """A class to represent a source where an item can be found.
    
    Attributes
        name : str
            The name of the source.
    """
    def __init__(self, name):
        self.name = name
        self.name_formatted = format_name(name)
        self.drops = []
        self.is_quest = False
        
        self.promo = False
        self.trivia = []
        self.categories = None
        
    def __str__(self):
        return f'{self.name}'

class Marketplace:
    """A class to represent the marketplace in Moonbounce.
    
    Attributes
        items : list
            A list of items that can be bought and sold in the marketplace.
        recipes : list
            A list of recipes that can be purchased in the marketplace.
    """
    def __init__(self, items, recipes):
        self.items = items
        self.recipes = recipes
        
    def __str__(self):
        return f'{len(self.items)} items in the marketplace.'

class MarketplaceItem:
    """A class to represent an item in the marketplace."""
    def __init__(self, name, section, cost, info=None):
        self.name = name
        self.section = section
        self.cost = cost,
        self.info = info

#endregion

# Reference for types and their plural forms
type_to_types_dict = {
    "accessory": "Accessories",
    "material": "Materials",
    "character": "Characters",
    "tool": "Tools",
    "unknown": "Unknown"
}

# Reference to rarity order
rarity_order = {
    "common": 1,
    "uncommon": 2,
    "rare": 3,
    "legendary": 4,
    "mythic": 5
}
    
#region Templates

#region Item Page Templates

itemPageTemplate = """\
[[Category:<TYPES>]][[Category:Items]][[Category:<RARITY>]]<PROMOCATEGORY><EXTRACATEGORIES>
{{Infobox
| name = <NAME>
| item_no = #<ID>
| image = <NAMEHYPHENED>.png
| rarity = <RARITY>
| type = <TYPE>
| description = <DESCRIPTION>
| diffuse_value = <VALUE>
| drops = <DROPS>
| craftable = <HAS_RECIPE>
| found_in = <FOUNDIN>
}}

The '''<NAME>''' is <AAN> [[<TYPE>]] in Moonbounce.

== Description ==

<DESCRIPTION>

== Found In ==

<FOUNDINBLOCK>

<RECIPEBLOCK>

<USAGEBLOCK>

== Trivia ==

<TRIVIATEXT>

== Gallery ==

<gallery>
<NAMEHYPHENED>.png | <NAME> item sprite
<GALLERYITEMS>
</gallery>
"""

characterTemplate = """\
[[Category:Character]][[Category:Items]][[Category:<RARITY>]]<PROMOCATEGORY>
{{Infobox
| name = <NAME>
| item_no = #<ID>
| image = <NAMEHYPHENED>.png
| rarity = <RARITY>
| type = <TYPE>
| description = <DESCRIPTION>
| diffuse_value = <VALUE>
| drops = <DROPS>
| craftable = <HAS_RECIPE>
| found_in = <FOUNDIN>
}}

'''<NAME>''' is a [[<TYPE>]] in Moonbounce.

== Description ==

<DESCRIPTION>

<APPEARANCEBODY>

== Found In ==

<FOUNDINBLOCK>

<RECIPEBLOCK>

== Trivia ==

<TRIVIATEXT>

== Gallery ==

<gallery>
<NAMEHYPHENED>.png | <NAME> item sprite
<GALLERYITEMS>
</gallery>
"""

#endregion

#region Main Page Templates
accessoriesPageTableTemplate = """\
== Alternative Sortable Table ==
{| class="wikitable sortable mw-collapsible mw-collapsed"
|+
!Preview
!Name
!Rarity
|-<ITEMS>
|}
"""

accessoriesPageTableItemTemplate = """
|[[File:<NAMEFORMATTED>.png|frameless|80x80px|link=<NAME>]]
|[[<NAME>]]
|<RARITY>
|-"""


materialsPageTableTemplate = """\
== Alternative Sortable Table ==
{| class="wikitable sortable mw-collapsible mw-collapsed"
|+
!Preview
!Name
!Rarity
|-<ITEMS>
|}
"""

materialsPageTableItemTemplate = """
|[[File:<NAMEFORMATTED>.png|frameless|80x80px|link=<NAME>]]
|[[<NAME>]]
|<RARITY>
|-"""


toolsPageTableTemplate = """\
== Alternative Sortable Table ==
{| class="wikitable sortable mw-collapsible mw-collapsed"
|+
!Preview
!Name
!Rarity
|-<ITEMS>
|}
"""

toolsPageTableItemTemplate = """
|[[File:<NAMEFORMATTED>.png|frameless|80x80px|link=<NAME>]]
|[[<NAME>]]
|<RARITY>
|-"""


characterPageTableTemplate = """\
== Alternative Sortable Table ==
{| class="wikitable sortable mw-collapsible mw-collapsed"
|+
!Preview
!Name
!Rarity
|-<ITEMS>
|}
"""

characterPageTableItemTemplate = """
|[[File:<NAMEFORMATTED>.png|frameless|80x80px|link=<NAME>]]
|[[<NAME>]]
|<RARITY>
|-"""

#endregion

#region Main Page Card Templates
accessoryCardBodyTemplate = """\
== Accessory List ==
<div class="card-container">
<ITEMS>
</div>"""

accessoryCardItemTemplate = """
{{Card
|title=<NAME>
|image=<NAMEHYPHENED>.png
|rarity=<RARITY>
|linktarget=<NAMEHYPHENED>
}}
"""

materialCardBodyTemplate = """\
== Material List ==
<div class="card-container">
<ITEMS>
</div>"""

materialCardItemTemplate = """
{{Card
|title=<NAME>
|image=<NAMEHYPHENED>.png
|rarity=<RARITY>
|linktarget=<NAMEHYPHENED>
}}
"""

toolCardBodyTemplate = """\
== Tool List ==
<div class="card-container">
<ITEMS>
</div>"""

toolCardItemTemplate = """
{{Card
|title=<NAME>
|image=<NAMEHYPHENED>.png
|rarity=<RARITY>
|linktarget=<NAMEHYPHENED>
}}
"""

characterCardBodyTemplate = """\
== Character List ==
<div class="card-container">
<ITEMS>
</div>"""

characterCardItemTemplate = """
{{Character Card
|name=<NAME>
|image=<NAME>.png
|rarity=<RARITY>
|description=<DESCRIPTION>
<HAS_RECIPE>
|linktarget=<NAMEHYPHENED>
|number=<ID>
}}
"""


card_template = """
{{Card
|title=<NAME>
|image=<IMAGE>.png
|linktarget=<NAMEHYPHENED>
}}\
"""

rarity_card_template = """
{{Card
|title=<NAME>
|image=<NAMEHYPHENED>.png
|rarity=<RARITY>
|linktarget=<NAMEHYPHENED>
}}\
"""

#endregion

#endregion

#region Helper functions
def replace_text(body, target, replacement):
    """Replace the target text in the body with the replacement text.
    
    Args:
        body (str): The body of text to search.
        target (str): The text to search for.
        replacement (str): The text to replace the target with.
    """
    if not isinstance(replacement, str):
        replacement = str(replacement)
    
    replaced = re.sub(target, replacement, body)
    return replaced

def has_recipe(item):
    """Check if the item has a recipe that creates it."""
    for recipe in recipes:
        if recipe.result == item:
            return 'Yes'
    return 'No'

def format_name(name):
    new_name = name.replace(" ", "_")
    
    # only replace the name's ? with - if it's P?t Ch?ck?n
    if name == "P?t Ch?ck?n":
        new_name = new_name.replace("?", "-")
    
    # remove #
    new_name = new_name.replace("#", "")
    
    return new_name

def check_if_in_marketplace(item_name, marketplace_items):
    """Check if the item is in the marketplace."""
    for mp_item in marketplace_items:
        if mp_item.name == item_name:
            return True
    return False

def download_images(items):
    should_download = True
    has_magick = True
    
    # check if imagemagick is available
    try:
        # check using windows formatting
        os.system('magick -version >nul 2>&1')
    except OSError:
        print('Imagemagick is not installed. Skipping webp conversion.')
        has_magick = False
    
    """Download the images for the items in the items list."""
    for item in items:
        if not should_download:
            return
        
        save_path = os.path.join(f'images/{item.type.lower()}')
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        save_path = os.path.join(save_path, f'{item.name_formatted}.png')
        save_path_webp = save_path.replace('.png', '.webp')
        
        if not os.path.exists(save_path) and not os.path.exists(save_path_webp):
            print(f'Downloading {item.name}...')
            # download the image by combining the UUID with the normal image path
            # https://moonbounce.gg/images/fp/<UUID>/c/f/preview.png
            image_path = f'https://moonbounce.gg/images/fp/{item.uuid}/c/f/preview.png'
            
            try:
                # save the image into the images directory, in a folder named after the item type
                image = requests.get(image_path, timeout=timeout)
                
                # replace ? with - in the name
                save_path = save_path.replace('?', '-')
                
                # save the image to the save path
                with open(save_path, 'wb') as f:
                    f.write(image.content)
                
                # check if imagemagick is installed
                if not has_magick:
                    continue
                
                # convert the image to webp using imagemagick
                os.system(f'convert "{save_path}" "{save_path_webp}"')
                os.remove(save_path)

            except requests.exceptions.Timeout:
                print(f"Request for {image_path} timed out after {timeout} seconds")
                print(f"The connection is likely blocked or unavailable, skipping further image downloads.")
                should_download = False
            except requests.exceptions.RequestException as e:
                print(f"An error occurred: {e}")
                
            # wait for 1 second before downloading the next image
            time.sleep(1)
        # else:
        #     print(f'{item.name} already exists.')
            
    print('Downloaded images.')

#endregion

def replace_template(template, item):
    """Replace the placeholders in the template with the actual data."""
    new_template = template
    new_template = replace_text(new_template, '<NAME>', item.name)
    new_template = replace_text(new_template, '<ID>', item.id)
    
    new_template = replace_text(new_template, '<NAMEHYPHENED>', item.name_formatted)
    
    new_template = replace_text(new_template, '<RARITY>', item.rarity)
    new_template = replace_text(new_template, '<TYPE>', item.type)
    new_template = replace_text(new_template, '<TYPES>', type_to_types_dict[item.type.lower()])
    new_template = replace_text(new_template, '<DESCRIPTION>', item.description)
    
    new_template = replace_text(new_template, '<PROMOCATEGORY>', '[[Category:Promos]]' if item.promo else '')
    categories = ''
    if item.categories:
        categories = ''.join([f'[[Category:{category}]]' for category in item.categories])
    new_template = replace_text(new_template, '<EXTRACATEGORIES>', categories)
    
    value_string = f'{item.value} MP' if item.value != None else 'Cannot be Diffused'
    new_template = replace_text(new_template, '<VALUE>', value_string)
    
    # if the source is an empty array, then set DROPS to No
    drops_string = 'No' if len(item.sources) == 0 else 'Yes'
    new_template = replace_text(new_template, '<DROPS>', drops_string)
    
    if len(item.sources) == 0:
        item.sources.append(Source('Nothing'))
    
    foundin_string = ', '.join([source.name for source in item.sources])
    new_template = replace_text(new_template, '<FOUNDIN>', foundin_string)
    
    # check if the item is a quest reward
    rewarding_quest = None
    for quest in quest_data:
        if item.name in [item.item_name for item in quest.rewards]:
            rewarding_quest = quest.quest_name
            break
        
    if rewarding_quest != None:
        print(f'(#{item.id}) {item.name} is a reward from {rewarding_quest}')
        quest_source = Source(rewarding_quest)
        quest_source.is_quest = True
        item.sources.append(quest_source)
    
    if item.sources[0].name == 'Nothing' and len(item.sources) == 1:
        if item.type == 'Character':
            foundin_block = "This character cannot be obtained as a drop."
        else:
            foundin_block = "This item cannot be obtained as a drop."
    else:
        foundin_block = "<div class=\"card-container left-align\">"
        
        for source in item.sources:
            # if the source is nothing, skip it
            if source.name == 'Nothing':
                continue
            
            source_card = card_template
            source_card = replace_text(source_card, '<NAME>', source.name)
            if source.is_quest:
                source_card = replace_text(source_card, '<IMAGE>', 'Quest')
                source_card = replace_text(source_card, '<NAMEHYPHENED>', format_name(source.name))
            else:
                source_card = replace_text(source_card, '<IMAGE>', format_name(source.name))
                source_card = replace_text(source_card, '<NAMEHYPHENED>', format_name(source.name))
            foundin_block += source_card
        
        foundin_block += "\n</div>"
    
    new_template = replace_text(new_template, '<FOUNDINBLOCK>', foundin_block)
    
    # check if the item has a recipe
    item_has_recipe = has_recipe(item.name)
    new_template = replace_text(new_template, '<HAS_RECIPE>', item_has_recipe)
    
    if recipes_enabled:
        recipe_block = "== Recipe ==\n\n"
        
        if item_has_recipe == 'Yes':
            for recipe in recipes:
                if recipe.result == item.name:
                    
                    recipe_block += "=== Ingredients ===\n\n"
                    recipe_block += "<div class=\"card-container left-align\">"
        
                    for ingredient in recipe.ingredients:
                        ingredient_card = card_template
                        ingredient_card = replace_text(ingredient_card, '<NAME>', ingredient)
                        ingredient_card = replace_text(ingredient_card, '<IMAGE>', format_name(ingredient))
                        ingredient_card = replace_text(ingredient_card, '<NAMEHYPHENED>', format_name(ingredient))
                        recipe_block += ingredient_card
                        
                    recipe_block += "\n</div>\n\n"
                    
                    if len(recipe.tools) > 0:
                        recipe_block += "=== Tools ===\n\n"
                        recipe_block += "<div class=\"card-container left-align\">"
                    
                        for tool in recipe.tools:
                            tool_card = card_template
                            tool_card = replace_text(tool_card, '<NAME>', tool)
                            tool_card = replace_text(tool_card, '<IMAGE>', format_name(tool))
                            tool_card = replace_text(tool_card, '<NAMEHYPHENED>', format_name(tool))
                            recipe_block += tool_card
                            
                        recipe_block += "\n</div>"
                        
        elif item_has_recipe == 'No':
            if item.type == 'Character':
                recipe_block += "This character cannot be crafted."
            else:
                recipe_block += "This item cannot be crafted."
    else:
        recipe_block = ""
        
    new_template = replace_text(new_template, '<RECIPEBLOCK>', recipe_block)
    

    # create a list of recipes and quests that use the item
    
    if usages_enabled:
        usage_block = f"== Used In ==\n\n"
        
        # check if the item has a usage (a recipe that uses it)
        used_recipes = []
        used_quests = []
        
        for recipe in recipes:
            if item.name in recipe.ingredients:
                used_recipes.append(recipe)
            if item.name in recipe.tools:
                used_recipes.append(recipe)
                
        for quest in quest_data:
            for required_item in quest.required_items:
                if item.name == required_item.item_name:
                    used_quests.append(quest)
        
        has_usages = False
        if len(used_recipes) > 0 or len(used_quests) > 0:
            has_usages = True

        if has_usages:
            if len(used_recipes) > 0:
                usage_block += "=== Recipes ===\n\n"
                
                usage_block += "<div class=\"card-container left-align\">"
                
                for recipe in used_recipes:
                    usage_card = card_template
                    usage_card = replace_text(usage_card, '<NAME>', recipe.result)
                    usage_card = replace_text(usage_card, '<IMAGE>', format_name(recipe.result))
                    usage_card = replace_text(usage_card, '<NAMEHYPHENED>', format_name(recipe.result))
                    usage_block += usage_card
                    
                usage_block += "\n</div>\n\n"
            
            if len(used_quests) > 0:
                usage_block += "=== Quests ===\n\n"
                
                usage_block += "<div class=\"card-container left-align\">"
                
                for quest in used_quests:
                    usage_card = card_template
                    usage_card = replace_text(usage_card, '<NAME>', quest.quest_name)
                    usage_card = replace_text(usage_card, '<IMAGE>', 'Quest')
                    usage_card = replace_text(usage_card, '<NAMEHYPHENED>', format_name(quest.quest_name))
                    usage_block += usage_card
                    
                usage_block += "\n</div>"
                
            new_template = replace_text(new_template, '<USAGEBLOCK>', usage_block)
        else:
            usage_block += "This item is not used in any recipes or quests."
    else:
        usage_block = ""
        
    new_template = replace_text(new_template, '<USAGEBLOCK>', usage_block)
    
    # replace the trivia text with the actual trivia or "Lorem upsum" if there is none
    trivia_text = '* Lorem ipsum'
    if len(item.trivia) > 0:
        trivia_text = '\n'.join(item.trivia)
    new_template = replace_text(new_template, '<TRIVIATEXT>', trivia_text)
    
    # replace the gallery items with the actual gallery items or an empty string if there are none
    gallery_items = ''
    if len(item.gallery) > 0:
        gallery_items = '\n'.join(item.gallery)
    new_template = replace_text(new_template, '<GALLERYITEMS>', gallery_items)
    
    # replace the appearance body with the actual appearance or an empty string if there is none
    appearance_body = ''
    if item.appearance:
        appearance_body = "== Appearance ==\n\n" + item.appearance
    new_template = replace_text(new_template, '<APPEARANCEBODY>', appearance_body)
            
    # remove all multiple empty lines
    new_template = re.sub(r'\n{3,}', '\n\n', new_template)
    
    return new_template



#region Main functions

#region Loading Data
def load_data(data_path, marketplace_data_path):
    """Load the data from the specified JSON file and populate the items and recipes lists."""
    
    with open("data/wiki_data.json", "r", encoding="utf-8") as f:
        wiki_data = json.load(f)
        
    wiki_item_data = wiki_data['items']
    wiki_source_data = wiki_data['sources']
    
    # Initialize the lists to store the items, recipes, and sources
    items = []
    recipes = []
    sources = []
    marketplace_items = []
    marketplace_recipes = []
    
    # Load the data from the JSON file
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)  
        
    # load the marketplace data from the JSON file
    with open(marketplace_data_path, 'r', encoding='utf-8') as f:
        marketplace_data = json.load(f)
    
    # load the marketplace items and recipes
    for item in marketplace_data['marketplace']['items']:
        mp_item = MarketplaceItem(item['name'], item['section'], item['cost'], item.get('info', None))
        marketplace_items.append(mp_item)
    for recipe in marketplace_data['marketplace']['recipes']:
        mp_recipe = MarketplaceItem(recipe['name'], recipe['section'], recipe['cost'], recipe.get('info', None))
        marketplace_recipes.append(mp_recipe)
        
    # add the marketplace to the sources list and add the items to the drops list
    marketplace_source = Source('Marketplace')
    marketplace_source.drops = [mp_item.name for mp_item in marketplace_items]
    sources.append(marketplace_source)
   
    # Go through the items in the JSON file and create a new Item object for each one
    for item in data['items']:
        item_sources = []
        for source_name in item['sources']:
            source = next((s for s in sources if s.name == source_name), None)              # Try and find the source in the sources list
            if not source:                                                                  # If it doesn't exist...
                source = Source(source_name)                                                # Create a new source
                
                # find the source in the wiki data
                wiki_source = next((s for s in wiki_source_data if s['name'] == source_name), None)
                if wiki_source:
                    source.promo = wiki_source['promo']
                    source.trivia = wiki_source['trivia']
                    source.categories = wiki_source['categories']
                
                sources.append(source)                                                      # Add it to the sources list
            item_sources.append(source)                                                     # Add the source to the item_sources list   
            source.drops.append(item['name'])                                               # Add the item to the source's drops list
                    
        # check if the item is in the marketplace
        if check_if_in_marketplace(item['name'], marketplace_items):
            item_sources.append(marketplace_source)
            
        new_item = Item(item['id'], item['name'], item['description'], item['type'], item['value'], item['rarity'], item_sources, item['uuid'])
        
        # check if the item is a promo item
        wiki_item = next((i for i in wiki_item_data if i['name'] == item['name']), None)
        if wiki_item:
            new_item.trivia = wiki_item['trivia']
            new_item.promo = wiki_item['promo']
            new_item.categories = wiki_item['categories']
            new_item.gallery = wiki_item['gallery']
            new_item.appearance = wiki_item['appearance']
        
        items.append(new_item)
        
    # Go through the recipes in the JSON file and create a new Recipe object for each one
    for recipe in data['recipes']:
        recipes.append(Recipe(recipe['result'], recipe['ingredients'], recipe['tools'], recipe['type']))
        
    # sort the sources alphabetically then output them to a file
    sources.sort(key=lambda x: x.name)
    with open(os.path.join(script_dir, '..', 'data', 'sources.txt'), 'w', encoding='utf-8') as f:
        for source in sources:
            output = f'{source.name}\n\t'
            output += "\n\t".join(source.drops)
            f.write(output + '\n\n')
    
    return items, recipes, sources
#endregion

#region Generating Wiki Data
def generate_wiki_articles(items, print_file_names=False):
    """Generate the wiki articles for the items in the items list."""
    
    print(f'Generating wiki articles. Recipes: {recipes_enabled}, Usages: {usages_enabled}')    
    
    for item in items:
        new_template = ''
        type_path = ''
        valid = False
        
        new_template = itemPageTemplate
        
        if item.type.lower() == 'accessory':
            type_path = 'accessories'
            new_template = new_template.replace('<AAN>', 'an')
            valid = True
        elif item.type.lower() == 'material':
            type_path = 'materials'
            new_template = new_template.replace('<AAN>', 'a')
            valid = True
        elif item.type.lower() == 'character':
            new_template = characterTemplate
            type_path = 'characters'
            valid = True
        elif item.type.lower() == 'tool':
            type_path = 'tools'
            new_template = new_template.replace('<AAN>', 'a')
            valid = True
        else:
            print(f'Uncaught Item type: {item.type} for {item.name}')
            # # TEMPORARILY CREATE THE ITEM AS IF IT WERE AN ACCESSORY
            # type_path = 'unknown'
            # new_template = new_template.replace('<AAN>', 'an')
            # valid = True
            
        if valid == True:
            # replace the placeholders with the actual data
            new_template = replace_template(new_template, item)

            # Construct the path to the appropriate directory one level up from the script
            wiki_type_path = os.path.join(script_dir, '..', 'wiki', type_path)
            
            # Check if the directory exists, and create it if it doesn't
            if not os.path.exists(wiki_type_path):
                os.makedirs(wiki_type_path)
            
            # write the new template to a file
            with open(os.path.join(wiki_type_path, f'{item.name_formatted}.mw'), 'w', encoding='utf-8') as f:
                f.write(new_template)
                if print_file_names:
                    print(f'Writing {item.name} to file')


recipe_table_template = """
=== <u><TYPENAME></u> ===
{| class="wikitable sortable mw-collapsible" style="width: 100%; max-width: 800px;"
|+ Recipes
! Result
!=
! colspan="3" | Ingredients
!+
! colspan="3" | Tools
<RECIPE_ROWS>
|}"""

recipe_row_template = """
|-
| <div style="text-align: center;">\
[[File:<RESULTHYPHEN>.png|frameless|64x64px|link=[[<RESULTHYPHEN>]]]]<br>\
'''[[<RESULT>]]'''\
</div>
|
<INGREDIENT1>
<INGREDIENT2>
<INGREDIENT3>
|
<TOOL1>
<TOOL2>
<TOOL3>
"""

recipe_use_item_template = """\
| <div style="text-align: center;">\
[[File:<ITEMHYPHEN>.png|frameless|64x64px|link=[[<ITEMHYPHEN>]]]]<br>\
'''[[<ITEM>]]'''\
</div>"""


def generate_recipe_table(recipes):
    """Generate the recipe table for the recipes in the recipes list."""
    
    # get all the types of recipe
    types = set([recipe.type for recipe in recipes])
    
    # turn the set into a list
    types = list(types)
    
    # sort the types alphabetically
    types.sort(key=lambda x: x.lower())
    
    # put all the partnership recipes at the end of the list
    partnership_recipes = [type for type in types if 'partnership' in type.lower()]
    types = [type for type in types if 'partnership' not in type.lower()]
    types += partnership_recipes
    
    recipe_type_tables = []
    
    # create a new recipe table for each type
    for type in types:
        new_table = recipe_table_template
        
        # keep only what's inside the ( ) in the type if there's a bracket
        type_display = type
        if '(' in type:
            type_display = type[type.index('(')+1:type.index(')')]
        
        new_table = replace_text(new_table, '<TYPENAME>', type_display)
        
        # get all the recipes of the current type
        type_recipes = [recipe for recipe in recipes if recipe.type == type]
        
        recipe_rows = []
        
        for recipe in type_recipes:
            new_row = recipe_row_template
            new_row = replace_text(new_row, '<RESULT>', recipe.result)
            new_row = replace_text(new_row, '<RESULTHYPHEN>', format_name(recipe.result))
            
            ingredient_template = recipe_use_item_template
            tool_template = recipe_use_item_template
            
            ingredient_sections = []
            tool_sections = []
            
            for ingredient in recipe.ingredients:
                new_ingredient = ingredient_template
                new_ingredient = replace_text(new_ingredient, '<ITEM>', ingredient)
                new_ingredient = replace_text(new_ingredient, '<ITEMHYPHEN>', format_name(ingredient))
                ingredient_sections.append(new_ingredient)
                
            for tool in recipe.tools:
                new_tool = tool_template
                new_tool = replace_text(new_tool, '<ITEM>', tool)
                new_tool = replace_text(new_tool, '<ITEMHYPHEN>', format_name(tool))
                tool_sections.append(new_tool)
                
            if len(ingredient_sections) < 3:
                for i in range(3 - len(ingredient_sections)):
                    ingredient_sections.append("|")
                    
            if len(tool_sections) < 3:
                for i in range(3 - len(tool_sections)):
                    tool_sections.append("|")
                    
            new_row = replace_text(new_row, '<INGREDIENT1>', ingredient_sections[0])
            new_row = replace_text(new_row, '<INGREDIENT2>', ingredient_sections[1])
            new_row = replace_text(new_row, '<INGREDIENT3>', ingredient_sections[2])
            
            new_row = replace_text(new_row, '<TOOL1>', tool_sections[0])
            new_row = replace_text(new_row, '<TOOL2>', tool_sections[1])
            new_row = replace_text(new_row, '<TOOL3>', tool_sections[2])
            
            recipe_rows.append(new_row)
            
        new_table = replace_text(new_table, '<RECIPE_ROWS>', ''.join(recipe_rows))
        
        recipe_type_tables.append(new_table)
        
        
        
        
    recipe_table = '\n\n\n'.join(recipe_type_tables)   
    
    with open(os.path.join(script_dir, '..', 'wiki', 'recipes.mw'), 'w', encoding='utf-8') as f:
        f.write(recipe_table)
        
    print('Generated recipe table.')


def generate_page_tables(items):
    """Generate the page tables for the items in the items list."""
    accessories_table = accessoriesPageTableTemplate
    materials_table = materialsPageTableTemplate
    tools_table = toolsPageTableTemplate
    characters_table = characterPageTableTemplate
    
    item_templates = {
        'accessory': accessoriesPageTableItemTemplate,
        'material': materialsPageTableItemTemplate,
        'tool': toolsPageTableItemTemplate,
        'character': characterPageTableItemTemplate
    }
    
    item_lists = {
        'accessory': [],
        'material': [],
        'tool': [],
        'character': []
    }
    
    for item in items:
        item_type = item.type.lower()
        if item_type in item_templates:
            new_item = item_templates[item_type]
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity)
            new_item = replace_text(new_item, '<NAMEFORMATTED>', format_name(item.name))
            item_lists[item_type].append(new_item)
                
    accessories_table = replace_text(accessories_table, '<ITEMS>', ''.join(item_lists['accessory']))
    materials_table = replace_text(materials_table, '<ITEMS>', ''.join(item_lists['material']))
    tools_table = replace_text(tools_table, '<ITEMS>', ''.join(item_lists['tool']))
    characters_table = replace_text(characters_table, '<ITEMS>', ''.join(item_lists['character']))
    
    with open(os.path.join(script_dir, '..', 'wiki', 'accessories-table.mw'), 'w', encoding='utf-8') as f:
        f.write(accessories_table)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'materials-table.mw'), 'w', encoding='utf-8') as f:
        f.write(materials_table)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'tools-table.mw'), 'w', encoding='utf-8') as f:
        f.write(tools_table)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'characters-table.mw'), 'w', encoding='utf-8') as f:
        f.write(characters_table)
        
    print('Generated page tables for accessories.')
    print('Generated page tables for materials.')
    print('Generated page tables for tools.')
    print('Generated page tables for characters.')


def generate_cards_lists(items):
    """Generate the material cards for the items in the items list."""
    accessory_card_body = accessoryCardBodyTemplate
    accessoryItems = []

    material_card_body = materialCardBodyTemplate
    materialItems = []

    tool_card_body = toolCardBodyTemplate
    toolItems = []
    
    character_card_body = characterCardBodyTemplate
    characterItems = []
    
    item_templates = {
        'accessory': (accessoryCardItemTemplate, accessoryItems),
        'material': (materialCardItemTemplate, materialItems),
        'tool': (toolCardItemTemplate, toolItems),
        'character': (characterCardItemTemplate, characterItems)
    }
    
    for item in items:
        item_type = item.type.lower()
        if item_type in item_templates:
            template, item_list = item_templates[item_type]
            new_item = replace_text(template, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity.lower())
            new_item = replace_text(new_item, '<NAMEHYPHENED>', format_name(item.name))
            
            if item_type == 'character':
                new_item = replace_text(new_item, '<DESCRIPTION>', item.description)
                new_item = replace_text(new_item, '<ID>', item.id)
                
                # find a recipe that creates the character
                for recipe in recipes:
                    if recipe.result == item.name:
                        new_item = replace_text(new_item, '<HAS_RECIPE>', '|craftable=Yes')
                        break
                else:
                    new_item = replace_text(new_item, '<HAS_RECIPE>', '')
                    

            item_list.append(new_item)
            
    # get all the characters from the item list to sort the generated cards by id
    characters = [item for item in items if item.type.lower() == 'character']
    characters.sort(key=lambda x: int(x.id))
    # sort each generated card by the id of the character
    characterItems = [item for character in characters for item in characterItems if character.name in item]
            
    accessory_card_body = replace_text(accessory_card_body, '<ITEMS>', ''.join(accessoryItems))
    material_card_body = replace_text(material_card_body, '<ITEMS>', ''.join(materialItems))
    tool_card_body = replace_text(tool_card_body, '<ITEMS>', ''.join(toolItems))
    character_card_body = replace_text(character_card_body, '<ITEMS>', ''.join(characterItems))
    
    with open(os.path.join(script_dir, '..', 'wiki', 'accessories-cards.mw'), 'w', encoding='utf-8') as f:
        f.write(accessory_card_body)
    
    with open(os.path.join(script_dir, '..', 'wiki', 'materials-cards.mw'), 'w', encoding='utf-8') as f:
        f.write(material_card_body)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'tools-cards.mw'), 'w', encoding='utf-8') as f:
        f.write(tool_card_body)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'characters-cards.mw'), 'w', encoding='utf-8') as f:
        f.write(character_card_body)
        
    print('Generated accessory cards.')
    print('Generated material cards.')
    print('Generated tool cards.')
    print('Generated character cards.')

# template is
# Containers
#   Alien Food Pouch
#   - table
#   Assorted Goodie Bag
#   - table

loot_table_template = """\
= Containers =
<CONTAINERS>
"""

# before the table is the image and name of the container
loot_table_container_template = """\
== <CONTAINER> ==

{| class="wikitable sortable mw-collapsible" style="min-width: 300px;"
|+ [[File:<CONTAINERHYPHEN>.png|frameless|80x80px|link=<CONTAINER>]] Loot Table
! Item
! Rarity
! Diffuse
<ITEMS>\
|}

"""

# image and name, rarity, diffuse value
loot_table_item_template = """\
|-
| {{Item | name = <NAME>}}
| <RARITY>
| <DIFFUSE>
"""

loot_table_card_container_template = """\
== <CONTAINER> ==

{| class="wikitable sortable mw-collapsible" style="width: 100%"
|+ [[File:<CONTAINERHYPHEN>.png|frameless|80x80px|link=<CONTAINER>]] Loot Table
<CARDS>\
|}

"""

loot_table_card_card_container_template = """\
|-
| <div class="card-container">\
<ITEMS>
</div>
"""

loot_source_page_template = """\
[[Category:Loot Sources]]<PROMOCATEGORY><EXTRACATEGORIES>
{{Infobox
| name = <NAME>
| image = <NAMEHYPHENED>.png
| type = Loot Source
}}The <NAME> is a [[Loot Source]] in Moonbounce.

== Loot Table ==

<div class="card-container left-align">\
<ITEMS>
</div>
"""



def generate_loot_table_page(items):
    """Generate the loot table page for the items in the items list based on their sources."""
    # loot_table = loot_table_template
    # loot_card_template = rarity_card_template
    # containers = []
    
    # for source in sources:
    #     new_container = loot_table_container_template
    #     new_container = replace_text(new_container, '<CONTAINER>', source.name)
    #     new_container = replace_text(new_container, '<CONTAINERHYPHEN>', format_name(source.name))
        
    #     items_rows = []
        
    #     for item in items:
    #         if source in item.sources:
    #             new_item = loot_card_template
    #             new_item = replace_text(new_item, '<NAME>', item.name)
    #             new_item = replace_text(new_item, '<RARITY>', item.rarity)
    #             if item.value == 0 or item.value == None:
    #                 new_item = replace_text(new_item, '<DIFFUSE>', 'Cannot be diffused')
    #             else:
    #                 new_item = replace_text(new_item, '<DIFFUSE>', f'{item.value} MP')
    #             items_rows.append(new_item)
                
    #     new_container = replace_text(new_container, '<ITEMS>', ''.join(items_rows))
    #     containers.append(new_container)
        
    # loot_table = replace_text(loot_table, '<CONTAINERS>', ''.join(containers))
    
    # with card container instead of table
    loot_table = loot_table_template
    loot_card_template = rarity_card_template
    containers = []
    
    for source in sources:
        # if the source is the marketplace, skip it
        if source.name == 'Marketplace':
            continue
        
        new_container = loot_table_card_container_template
        new_container = replace_text(new_container, '<CONTAINER>', source.name)
        new_container = replace_text(new_container, '<CONTAINERHYPHEN>', format_name(source.name))
        
        items_rows = []
        
        # sort items by rarity, then by name
        sorted_items = sorted(items, key=lambda x: (rarity_order[x.rarity.lower()], x.name))
        
        for item in sorted_items:
            if source in item.sources:
                new_item = loot_card_template
                new_item = replace_text(new_item, '<NAME>', item.name)
                new_item = replace_text(new_item, '<RARITY>', item.rarity)
                # if the item's name is P?t Ch?ck?n, replace the name with Pet Chicken
                if item.name == 'P?t Ch?ck?n':
                    new_item = replace_text(new_item, '<NAMEHYPHENED>', 'Pet_Chicken')
                else:
                    new_item = replace_text(new_item, '<NAMEHYPHENED>', format_name(item.name))
                items_rows.append(new_item)
                
        # merge item_rows into loot_table_card_card_container_template
        new_container = replace_text(new_container, '<CARDS>', loot_table_card_card_container_template)
                
        new_container = replace_text(new_container, '<ITEMS>', ''.join(items_rows))
        containers.append(new_container)
        
    loot_table = replace_text(loot_table, '<CONTAINERS>', ''.join(containers))    
    
    with open(os.path.join(script_dir, '..', 'wiki', 'loot-table.mw'), 'w', encoding='utf-8') as f:
        f.write(loot_table)
        
    print('Generated loot table page.')

def generate_loot_source_pages(items):
    # create the sources directory if it doesn't exist
    sources_dir = os.path.join(script_dir, '..', 'wiki', 'sources')
    if not os.path.exists(sources_dir):
        os.makedirs(sources_dir)
        
    for source in sources:
        # if the source is the marketplace, skip it
        if source.name == 'Marketplace':
            continue
        
        new_template = loot_source_page_template
        new_template = replace_text(new_template, '<NAME>', source.name)
        new_template = replace_text(new_template, '<NAMEHYPHENED>', format_name(source.name))
        
        new_template = replace_text(new_template, '<PROMOCATEGORY>', '[[Category:Promos]]' if source.promo else '')
        
        extra_categories = ''
        if source.categories:
            print(f'{source.name} has categories: {source.categories}')
            
            extra_categories = ''.join([f'[[Category:{category}]]' for category in source.categories])
        new_template = replace_text(new_template, '<EXTRACATEGORIES>', extra_categories)
        
        items_rows = []
        
        # sort items by rarity, then by name
        sorted_items = sorted(items, key=lambda x: (rarity_order[x.rarity.lower()], x.name))        
        
        for item in sorted_items:
            if source in item.sources:
                new_item = rarity_card_template
                new_item = replace_text(new_item, '<NAME>', item.name)
                new_item = replace_text(new_item, '<RARITY>', item.rarity)
                new_item = replace_text(new_item, '<NAMEHYPHENED>', format_name(item.name))
                
                items_rows.append(new_item)
                
        new_template = replace_text(new_template, '<ITEMS>', ''.join(items_rows))
        
        # add trivia to the source page
        trivia_text = ''
        if source.trivia:
            trivia_text = '\n== Trivia ==\n\n' + '\n'.join(source.trivia)
            new_template += trivia_text
        
        with open(os.path.join(sources_dir, f'{format_name(source.name)}.mw'), 'w', encoding='utf-8') as f:
            f.write(new_template)
        
    print(f'Generated loot source pages for {len(sources) - 1} sources.')


# generate sources.json
def generate_sources_json():
    # structure:
    # {
    #     "sources": [
    #         {
    #             "name": "source name",
    #             "drops": ["item1", "item2", ...]
    #         }
    #     ]
    # }
    # output to data/generated_sources.json
    sources_json = {
        "sources": []
    }
    
    # load moonbounceplus.json and loop through every item to get the sources
    item_data = None
    with open('data/moonbounceplus.json', 'r', encoding='utf-8') as f:
        item_data = json.load(f)
        item_data = item_data['items']
        
    for item in items:
        for source in sources:
            if item.name in source.drops:
                # check if the source is already in the sources_json
                source_json = next((s for s in sources_json['sources'] if s['name'] == source.name), None)
                if not source_json:
                    source_json = {
                        "name": source.name,
                        "drops": []
                    }
                    sources_json['sources'].append(source_json)
                
                source_json['drops'].append(item.name)
                
    # sort the sources alphabetically
    sources_json['sources'].sort(key=lambda x: x['name'])
    
    # sort the drops in each source by rarity, then by name
    for source in sources_json['sources']:
        source['drops'].sort(key=lambda x: (rarity_order[next((i.rarity for i in items if i.name == x), 'Common').lower()], x))
                
    with open(os.path.join(script_dir, '..', 'data', 'sources.json'), 'w', encoding='utf-8') as f:
        json.dump(sources_json, f, indent=4)


#endregion

#region Update Readme
def update_readme():
    from pathlib import Path
    
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    
    # load README.md
    with open(os.path.join(root_dir, 'README.md'), 'r', encoding='utf-8') as f:
        readme = f.read()
        
    # load MoonbouncePlus.user.js
    with open(os.path.join(script_dir, 'MoonbouncePlus.user.js'), 'r', encoding='utf-8') as f:
        script = f.read()
        
    # find the @version
    script_version = re.search(r'@version\s+\d+\.\d+\.\d+', script)    
    # strip the @version from the string
    script_version = re.search(r'\d+\.\d+\.\d+', script_version.group())
    script_version = 'v' + script_version.group()

    # find the shields.io Version badge
    readme_version = re.search(r'v\d+\.\d+\.\d+', readme)
    readme_version = readme_version.group()
    
    if script_version == readme_version:
        return
    
    print(f'Updating README version {readme_version} -> {script_version}')
    
    # update the version in the README.md
    readme = readme.replace(readme_version, f'{script_version}')
    
    # save the updated README.md
    with open(os.path.join(script_dir, '..', 'README.md'), 'w', encoding='utf-8') as f:
        f.write(readme)    

#endregion

#endregion

if __name__ == '__main__':
    # Initialize the lists to store the items, recipes, and sources
    items, recipes, sources = load_data(data_path, marketplace_data_path)
    
    initial_items = items.copy()
    
    # load quests from the JSON file
    quest_data = quests.load_quests(quests_data_path)
    
    print(f'Loaded {len(items)} items and {len(recipes)} recipes.')
    print(f'Loaded {len(sources)} sources.')
    
    # print the number of each type of item in the items list
    print(f'Accessories: {len([item for item in items if item.type == "Accessory"])}')
    print(f'Materials: {len([item for item in items if item.type == "Material"])}')
    print(f'Tools: {len([item for item in items if item.type == "Tool"])}')
    print(f'Characters: {len([item for item in items if item.type == "Character"])}')
    
    generate_wiki_articles(items)
    
    generate_recipe_table(recipes)
    
    # sort items by name
    items.sort(key=lambda x: x.name)    
    
    # generate_page_tables(items)
    generate_cards_lists(items)
    
    generate_page_tables(items)
    generate_loot_table_page(items)
    
    generate_loot_source_pages(items)
    
    download_images(items)
    
    generate_sources_json()
    
    update_readme()