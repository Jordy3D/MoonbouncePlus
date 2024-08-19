import json
import os
import re
import requests
import time

        
# Initialize the path to the JSON file
script_dir = os.path.dirname(__file__)
data_path = os.path.join(script_dir, '..', 'data', 'MoonbouncePlus.json')

recipes_enabled = False
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

accessoryTemplate = """\
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
| found_in = <FOUNDIN>
}}

The '''<NAME>''' is an [[Accessory]] in Moonbounce.

== Appearance ==
Lorem Ipsum

<RECIPEBLOCK>

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""

materialTemplate = """\
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
| found_in = <FOUNDIN>
}}
The '''<NAME>''' is a [[Material]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""

characterTemplate = """\
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
| found_in = <FOUNDIN>
}}
'''<NAME>''' is a [[Character]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""

toolTemplate = """\
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
| found_in = <FOUNDIN>
}}
The '''<NAME>''' is a [[Tool]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
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


toolCardBodyTemplte = """\
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
    new_name = name.replace(" ", "_")
    new_name = new_name.replace("?", "-")
    # remove #
    new_name = new_name.replace("#", "")
    
    return new_name

def replace_template(template, item):
    """Replace the placeholders in the template with the actual data."""
    new_template = template
    new_template = replace_text(new_template, '<NAME>', item.name)
    new_template = replace_text(new_template, '<ID>', item.id)
    
    new_template = replace_text(new_template, '<NAMEHYPHENED>', item.name_formatted)
    
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
    
    if len(item.sources) == 0:
        item.sources.append(Source('Nothing'))
    
    
    foundin_string = ', '.join([source.name for source in item.sources])
    
    
          
    new_template = replace_text(new_template, '<FOUNDIN>', foundin_string)

    # check if the item has a recipe
    item_has_recipe = has_recipe(item.name)
    new_template = replace_text(new_template, '<HAS_RECIPE>', item_has_recipe)
    
    if item_has_recipe == 'Yes' and recipes_enabled:
        recipe_block = f"== Recipe ==\n"
        
        table_format = """
{| class="wikitable" style="text-align: center;"
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
    should_download = True
    
    """Download the images for the items in the items list."""
    for item in items:
        if not should_download:
            return
        
        save_path = os.path.join(f'images/{item.type.lower()}')
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        save_path = os.path.join(save_path, f'{item.name_formatted}.png')
        
        if not os.path.exists(save_path):
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
            print(f'Uncaught Item type: {item.type} for {item.name}')
            # # TEMPORARILY CREATE THE ITEM AS IF IT WERE AN ACCESSORY
            # new_template = accessoryTemplate
            # type_path = 'unknown'
            # valid = True            
            
        # print any items with 4 or more sources
        # if len(item.sources) >= 4:
        #     print(f'{item.name} has {len(item.sources)} sources.')
            
        if valid == True:
            # replace the placeholders with the actual data
            new_template = replace_template(new_template, item)
                
            # check if the item has a recipe
            new_template = replace_text(new_template, '<HAS_RECIPE>', has_recipe(item.name))

            # Construct the path to the appropriate directory one level up from the script
            wiki_type_path = os.path.join(script_dir, '..', 'wiki', type_path)
            
            # Check if the directory exists, and create it if it doesn't
            if not os.path.exists(wiki_type_path):
                os.makedirs(wiki_type_path)
            
            # write the new template to a file
            with open(os.path.join(wiki_type_path, f'{item.name_formatted}.txt'), 'w', encoding='utf-8') as f:
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
! colspan="2" | Tools
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
                    
            if len(tool_sections) < 2:
                for i in range(2 - len(tool_sections)):
                    tool_sections.append("|")
                    
            new_row = replace_text(new_row, '<INGREDIENT1>', ingredient_sections[0])
            new_row = replace_text(new_row, '<INGREDIENT2>', ingredient_sections[1])
            new_row = replace_text(new_row, '<INGREDIENT3>', ingredient_sections[2])
            
            new_row = replace_text(new_row, '<TOOL1>', tool_sections[0])
            new_row = replace_text(new_row, '<TOOL2>', tool_sections[1])            
            
            recipe_rows.append(new_row)
            
        new_table = replace_text(new_table, '<RECIPE_ROWS>', ''.join(recipe_rows))
        
        recipe_type_tables.append(new_table)
        
        
        
        
    recipe_table = '\n\n\n'.join(recipe_type_tables)   
    
    with open(os.path.join(script_dir, '..', 'wiki', 'recipes.txt'), 'w', encoding='utf-8') as f:
        f.write(recipe_table)
        
    print('Generated recipe table.')


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
    accessory_card_body = accessoryCardBodyTemplate
    accessoryItems = []

    material_card_body = materialCardBodyTemplate
    materialItems = []

    tool_card_body = toolCardBodyTemplte
    toolItems = []
    
    for item in items:
        if item.type.lower() == 'accessory':
            new_item = accessoryCardItemTemplate
            new_item = replace_text(new_item, '<NAME>', item.name)
            new_item = replace_text(new_item, '<RARITY>', item.rarity.lower())
            new_item = replace_text(new_item, '<NAMEHYPHENED>', format_name(item.name))
            accessoryItems.append(new_item)
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
    
    accessory_card_body = replace_text(accessory_card_body, '<ITEMS>', ''.join(accessoryItems))
    material_card_body = replace_text(material_card_body, '<ITEMS>', ''.join(materialItems))
    tool_card_body = replace_text(tool_card_body, '<ITEMS>', ''.join(toolItems))
    
    with open(os.path.join(script_dir, '..', 'wiki', 'accessories-cards.txt'), 'w', encoding='utf-8') as f:
        f.write(accessory_card_body)
    
    with open(os.path.join(script_dir, '..', 'wiki', 'materials-cards.txt'), 'w', encoding='utf-8') as f:
        f.write(material_card_body)
        
    with open(os.path.join(script_dir, '..', 'wiki', 'tools-cards.txt'), 'w', encoding='utf-8') as f:
        f.write(tool_card_body)
        
    print('Generated accessory cards.')
    print('Generated material cards.')
    print('Generated tool cards.')

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

loot_source_page_template = """\
{{Infobox
| name = <NAME>
| image = <NAMEHYPHENED>.png
| type = Loot Source
}}The <NAME> is a [[Loot Source]] in Moonbounce.

== Loot Table ==
{| class="wikitable sortable" style="min-width: 300px;"
| Item
| Rarity
| Diffuse
<ITEMS>\
|}
"""


def generate_loot_table_page(items):
    """Generate the loot table page for the items in the items list based on their sources."""
    loot_table = loot_table_template
    containers = []
    
    for source in sources:
        new_container = loot_table_container_template
        new_container = replace_text(new_container, '<CONTAINER>', source.name)
        new_container = replace_text(new_container, '<CONTAINERHYPHEN>', format_name(source.name))
        
        items_rows = []
        
        for item in items:
            if source in item.sources:
                new_item = loot_table_item_template
                new_item = replace_text(new_item, '<NAME>', item.name.replace('?', '-') )
                new_item = replace_text(new_item, '<RARITY>', item.rarity)
                if item.value == 0 or item.value == None:
                    new_item = replace_text(new_item, '<DIFFUSE>', 'Cannot be diffused')
                else:
                    new_item = replace_text(new_item, '<DIFFUSE>', f'{item.value} MP')
                items_rows.append(new_item)
                
        new_container = replace_text(new_container, '<ITEMS>', ''.join(items_rows))
        containers.append(new_container)
        
    loot_table = replace_text(loot_table, '<CONTAINERS>', ''.join(containers))
    
    with open(os.path.join(script_dir, '..', 'wiki', 'loot-table.txt'), 'w', encoding='utf-8') as f:
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
        
        items_rows = []
        
        for item in items:
            if source in item.sources:
                new_item = loot_table_item_template
                new_item = replace_text(new_item, '<NAME>', item.name)
                new_item = replace_text(new_item, '<RARITY>', item.rarity)
                if item.value == 0 or item.value == None:
                    new_item = replace_text(new_item, '<DIFFUSE>', 'Cannot be diffused')
                else:
                    new_item = replace_text(new_item, '<DIFFUSE>', f'{item.value} MP')
                items_rows.append(new_item)
                
        new_template = replace_text(new_template, '<ITEMS>', ''.join(items_rows))
        
        with open(os.path.join(sources_dir, f'{format_name(source.name)}.txt'), 'w', encoding='utf-8') as f:
            f.write(new_template)
        
    print(f'Generated loot source pages for {len(sources) - 1} sources.')
#endregion

#endregion


if __name__ == '__main__':
    # Initialize the lists to store the items, recipes, and sources
    items, recipes, sources = load_data(data_path)
    
    print(f'Loaded {len(items)} items and {len(recipes)} recipes.')
    print(f'Loaded {len(sources)} sources.')
    
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