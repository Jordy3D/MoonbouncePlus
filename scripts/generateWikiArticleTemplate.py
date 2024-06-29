import json
import os
import re
import requests
import time

        
# Initialize the path to the JSON file
script_dir = os.path.dirname(__file__)
data_path = os.path.join(script_dir, '..', 'data', 'MoonbouncePlus.json')

recipes_enabled = False

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
        
        self.name_hyphen = format_name(name)
        
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
        self.name_hyphen = format_name(name)
        self.drops = []
        
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
}
    
#region Templates

#region Item Page Templates

foundinTemplate = """\
| found_in<INDEX> = <SOURCE>
| foundin_icon<INDEX> = <SOURCEHYPHENED>"""

accessoryTemplate = """
{{Infobox
| name = <NAME>
| item_no = #<ID>
| image = <NAMEHYPHENED>.png
| rarity = <RARITY>
| type = <TYPE>
| description = <DESCRIPTION>
| diffuse_value = <VALUE> MP
| drops = <DROPS>
| craftable = <HAS_RECIPE>
<FOUNDIN>
}}

The '''<NAME>''' is an [[Accessories|accessory]] in Moonbounce.

== Appearance ==
Lorem Ipsum

<RECIPEBLOCK>

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""

materialTemplate = """
{{Infobox
| name = <NAME>
| item_no = #<ID>
| image = <NAMEHYPHENED>.png
| rarity = <RARITY>
| type = <TYPE>
| description = <DESCRIPTION>
| diffuse_value = <VALUE> MP
| drops = <DROPS>
| craftable = <HAS_RECIPE>
<FOUNDIN>
}}
The '''<NAME>''' is a [[Materials|material]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""

characterTemplate = """
{{Infobox
| name = <NAME>
| item_no = #<ID>
| image = <NAMEHYPHENED>.png
| rarity = <RARITY>
| type = <TYPE>
| description = <DESCRIPTION>
| diffuse_value = <VALUE> MP
| drops = <DROPS>
| craftable = <HAS_RECIPE>
<FOUNDIN>
}}
'''<NAME>''' is a [[Characters|character]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""

toolTemplate = """
{{Infobox
| name = <NAME>
| item_no = #<ID>
| image = <NAMEHYPHENED>.png
| rarity = <RARITY>
| type = <TYPE>
| description = <DESCRIPTION>
| diffuse_value = <VALUE> MP
| drops = <DROPS>
| craftable = <HAS_RECIPE>
<FOUNDIN>
}}
The '''<NAME>''' is a [[Tools|tool]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""
#endregion

#region Main Page Templates
accessoriesPageTableTemplate = """
=== Released ===
{| class="wikitable sortable mw-collapsible"
!Preview
!Name
!Rarity
|-<ITEMS>
|}
"""

accessoriesPageTableItemTemplate = """
|[[File:<NAMEFORMATTED>.png|frameless|80x80px]]
|[[<NAME>]]
|<RARITY>
|-"""


materialsPageTableTemplate = """
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
|[[File:<NAMEFORMATTED>.png|frameless|80x80px]]
|[[<NAME>]]
|<RARITY>
|-"""


toolsPageTableTemplate = """
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
|[[File:<NAMEFORMATTED>.png|frameless|80x80px]]
|[[<NAME>]]
|<RARITY>
|-"""

#endregion

#region Main Page Card Templates
materialCardBodyTemplate = """
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


toolCardBodyTemplte = """
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
    # formats the name from Item Name to Item_Name
    return name.replace(" ", "_")

def replace_template(template, item):
    """Replace the placeholders in the template with the actual data."""
    new_template = template
    new_template = replace_text(new_template, '<NAME>', item.name)
    new_template = replace_text(new_template, '<ID>', item.id)
    
    new_template = replace_text(new_template, '<NAMEHYPHENED>', item.name_hyphen)
    
    new_template = replace_text(new_template, '<RARITY>', item.rarity)
    new_template = replace_text(new_template, '<TYPE>', item.type)
    new_template = replace_text(new_template, '<DESCRIPTION>', item.description)
    if item.value == 0 or item.value == None:
        new_template = replace_text(new_template, '<VALUE>', 'Cannot be Diffused for')
    else:
        new_template = replace_text(new_template, '<VALUE>', item.value)
    # if the source is an empty array, then set DROPS to No
    if len(item.sources) == 0:
        new_template = replace_text(new_template, '<DROPS>', 'No')
    else:
        new_template = replace_text(new_template, '<DROPS>', 'Yes')
        
    source_sections = []
    
    for i, source in enumerate(item.sources):
        # if i = 0, then it's the first source, so don't add an index
        index = '' if i == 0 else i + 1
        found_section = foundinTemplate
        
        if i == 0 and len(item.sources) == 0:
            found_section = replace_text(found_section, '<SOURCE>', 'Nothing')
            found_section = replace_text(found_section, '<SOURCEHYPHENED>', 'X.png')
        else:
            # wrap the name and the image in a link to the source page
            found_section = replace_text(found_section, f'<SOURCE>', f'[[{source.name}]]')
            found_section = replace_text(found_section, f'<SOURCEHYPHENED>', f'{source.name_hyphen}.png')
        
        found_section = replace_text(found_section, '<INDEX>', index)
        source_sections.append(found_section)
          
    new_template = replace_text(new_template, '<FOUNDIN>', ''.join(source_sections))

    # check if the item has a recipe
    item_has_recipe = has_recipe(item.name)
    new_template = replace_text(new_template, '<HAS_RECIPE>', item_has_recipe)
    
    if item_has_recipe == 'Yes' and recipes_enabled:
        recipe_block = f"== Recipe ==\n"
        
        table_format = """
{| class="wikitable"
|-
{ingredient_chunk}
|-
{tool_chunk}
|}
"""

        ingredients_chunk = """
| colspan="3" | Ingredients
|-
| {ingredients_row}
"""

        tool_chunk = """
| colspan="3" | Tools
|-
| {tools_row}
"""
        
        for recipe in recipes:
            if recipe.result == item.name:
                ingredients_row_items = []
                tools_row_items = []
                ingredients_row_string = ""
                tools_row_string = ""
                
                
                for ingredient in recipe.ingredients:
                    ingredient_image = f"[[File:{format_name(ingredient)}.png|50px|link={ingredient}]]"
                    ingredients_row_items.append(f"{ingredient_image}<br>[[{ingredient}]]")
                    
                for tool in recipe.tools:
                    tool_image = f"[[File:{format_name(tool)}.png|50px]]"
                    tools_row_items.append(f"{tool_image}<br>[[{tool}]]")
                    
                # if there are less than 3 ingredients, add empty cells to the row
                if len(ingredients_row_items) < 3:
                    for i in range(3 - len(ingredients_row_items)):
                        ingredients_row_items.append("")
                if len(tools_row_items) < 3:
                    for i in range(3 - len(tools_row_items)):
                        tools_row_items.append("")
                
                ingredients_row_string = " || ".join(ingredients_row_items)
                
                # Replace the placeholders in the ingredient and tool chunks
                ingredients_chunk = replace_text(ingredients_chunk, '{ingredients_row}', ingredients_row_string)
                table_format = replace_text(table_format, '{ingredient_chunk}', ingredients_chunk)

                # if there's no tools, then hide the tools row
                if len(tools_row_items) != 0:
                    tools_row_string = " || ".join(tools_row_items)            
                    tool_chunk = replace_text(tool_chunk, '{tools_row}', tools_row_string)
                
                    # Replace the placeholders in the table format
                    table_format = replace_text(table_format, '{tool_chunk}', tool_chunk)
                else:
                    table_format = replace_text(table_format, '{tool_chunk}', "")
                
                recipe_block += table_format
        
        new_template = replace_text(new_template, '<RECIPEBLOCK>', recipe_block)
    else:
        new_template = replace_text(new_template, '<RECIPEBLOCK>', '')
    return new_template

def check_if_in_marketplace(item_name, marketplace_items):
    """Check if the item is in the marketplace."""
    for mp_item in marketplace_items:
        if mp_item.name == item_name:
            return True
    return False

def download_images(items):
    """Download the images for the items in the items list."""
    for item in items:
        
        save_path = os.path.join(f'images/{item.type.lower()}')
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        save_path = os.path.join(save_path, f'{item.name_hyphen}.png')
        
        if not os.path.exists(save_path):
            print(f'Downloading {item.name}...')
            # download the image by combining the UUID with the normal image path
            # https://moonbounce.gg/images/fp/<UUID>/c/f/preview.png
            image_path = f'https://moonbounce.gg/images/fp/{item.uuid}/c/f/preview.png'
            
            # save the image into the images directory, in a folder named after the item type
            image = requests.get(image_path)
            
            # save the image to the save path
            with open(save_path, 'wb') as f:
                f.write(image.content)

                
            # wait for 1 second before downloading the next image
            time.sleep(1)
        else:
            print(f'{item.name} already exists.')
            
    print('Downloaded images.')
#endregion


#region Main functions

#region Loading Data
def load_data(data_path):
    """Load the data from the specified JSON file and populate the items and recipes lists."""
    
    # Initialize the lists to store the items, recipes, and sources
    items = []
    recipes = []
    sources = []
    marketplace_items = []
    marketplace_recipes = []
    
    # Load the data from the JSON file
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)  
    
    # load the marketplace items and recipes
    for item in data['marketplace']['items']:
        mp_item = MarketplaceItem(item['name'], item['section'], item['cost'], item.get('info', None))
        marketplace_items.append(mp_item)
    for recipe in data['marketplace']['recipes']:
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
                sources.append(source)                                                      # Add it to the sources list
            item_sources.append(source)                                                     # Add the source to the item_sources list   
            source.drops.append(item['name'])                                               # Add the item to the source's drops list
                    
        # check if the item is in the marketplace
        if check_if_in_marketplace(item['name'], marketplace_items):
            item_sources.append(marketplace_source)
        
        items.append(Item(item['id'], item['name'], item['description'], item['type'], item['value'], item['rarity'], item_sources, item['uuid']))
        
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
    for item in items:
        new_template = ''
        type_path = ''
        valid = False
        
        if item.type.lower() == 'accessory':
            new_template = accessoryTemplate
            type_path = 'accessories'
            valid = True
        elif item.type.lower() == 'material':
            new_template = materialTemplate
            type_path = 'materials'
            valid = True
        elif item.type.lower() == 'character':
            new_template = characterTemplate
            type_path = 'characters'
            valid = True
        elif item.type.lower() == 'tool':
            new_template = toolTemplate
            type_path = 'tools'
            valid = True
        else:
            print(f'Uncaught type: {item.type}')
            
        # print any items with 4 or more sources
        if len(item.sources) >= 4:
            print(f'{item.name} has {len(item.sources)} sources.')
            
        if valid == True:
            # replace the placeholders with the actual data
            new_template = replace_template(new_template, item)
                
            # check if the item has a recipe
            new_template = replace_text(new_template, '<HAS_RECIPE>', has_recipe(item.name))

            # Construct the path to the 'accessories' directory one level up from the script
            accessories_path = os.path.join(script_dir, '..', 'wiki', type_path)
            
            # Check if the directory exists, and create it if it doesn't
            if not os.path.exists(accessories_path):
                os.makedirs(accessories_path)
            
            # write the new template to a file
            with open(os.path.join(accessories_path, f'{item.name_hyphen}.txt'), 'w', encoding='utf-8') as f:
                f.write(new_template)
                if print_file_names:
                    print(f'Writing {item.name} to file')


def generate_page_tables(items):
    """Generate the page tables for the items in the items list."""
    accessories_table = accessoriesPageTableTemplate
    materials_table = materialsPageTableTemplate
    tools_table = toolsPageTableTemplate
    accesoryItems = []
    materialItems = []
    toolItems = []
    
    for item in items:
        if item.type.lower() == 'accessory':
            new_item = accessoriesPageTableItemTemplate
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity)
            new_item = replace_text(new_item, '<NAMEFORMATTED>', format_name(item.name))
            accesoryItems.append(new_item)
        if item.type.lower() == 'material':
            new_item = materialsPageTableItemTemplate
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity)
            new_item = replace_text(new_item, '<NAMEFORMATTED>', format_name(item.name))
            materialItems.append(new_item)
        if item.type.lower() == 'tool':
            new_item = toolsPageTableItemTemplate
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity)
            new_item = replace_text(new_item, '<NAMEFORMATTED>', format_name(item.name))
            toolItems.append(new_item)
        
    
    accessories_table = replace_text(accessories_table, '<ITEMS>', ''.join(accesoryItems))
    materials_table = replace_text(materials_table, '<ITEMS>', ''.join(materialItems))
    tools_table = replace_text(tools_table, '<ITEMS>', ''.join(toolItems))
    
    with open(os.path.join(script_dir, '..', 'wiki', 'accessories-table.txt'), 'w', encoding='utf-8') as f:
        f.write(accessories_table)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'materials-table.txt'), 'w', encoding='utf-8') as f:
        f.write(materials_table)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'tools-table.txt'), 'w', encoding='utf-8') as f:
        f.write(tools_table)
        
    print('Generated page tables for accessories.')
    print('Generated page tables for materials.')
    print('Generated page tables for tools.')


def generate_cards_lists(items):
    """Generate the material cards for the items in the items list."""
    material_card_body = materialCardBodyTemplate
    tool_card_body = toolCardBodyTemplte
    materialItems = []
    toolItems = []
    
    for item in items:
        if item.type.lower() == 'material':
            new_item = materialCardItemTemplate
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity.lower())
            new_item = replace_text(new_item, '<NAMEHYPHENED>', format_name(item.name))
            materialItems.append(new_item)
        if item.type.lower() == 'tool':
            new_item = toolCardItemTemplate
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity.lower())
            new_item = replace_text(new_item, '<NAMEHYPHENED>', format_name(item.name))
            toolItems.append(new_item)
    
    material_card_body = replace_text(material_card_body, '<ITEMS>', ''.join(materialItems))
    tool_card_body = replace_text(tool_card_body, '<ITEMS>', ''.join(toolItems))
    
    with open(os.path.join(script_dir, '..', 'wiki', 'materials-cards.txt'), 'w', encoding='utf-8') as f:
        f.write(material_card_body)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'tools-cards.txt'), 'w', encoding='utf-8') as f:
        f.write(tool_card_body)
        
    print('Generated material cards.')
    print('Generated tool cards.')
#endregion

#endregion


if __name__ == '__main__':
    # Initialize the lists to store the items, recipes, and sources
    items, recipes, sources = load_data(data_path)
    
    print(f'Loaded {len(items)} items and {len(recipes)} recipes.')
    print(f'Loaded {len(sources)} sources.')
    
    generate_wiki_articles(items)
    
    # sort items by name
    items.sort(key=lambda x: x.name)    
    
    # generate_page_tables(items)
    # generate_cards_lists(items)
    # download_images(items)