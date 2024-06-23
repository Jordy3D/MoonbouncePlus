import json
import os
import re

        
# Initialize the path to the JSON file
script_dir = os.path.dirname(__file__)
data_path = os.path.join(script_dir, '..', 'data', 'MoonbouncePlus.json')


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
    """
    
    def __init__(self, id, name, description, type, value, rarity, sources):
        self.id = id
        self.name = name
        self.description = description
        self.type = type.lower().capitalize()
        self.value = value
        self.rarity = rarity.lower().capitalize()
        self.sources = sources
        
        self.name_hyphen = name.replace(" ", "-").lower()
        self.name_hyphen = self.name_hyphen[0].upper() + self.name_hyphen[1:]
        
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
        self.name_hyphen = name.replace(" ", "-").lower()
        self.name_hyphen = self.name_hyphen[0].upper() + self.name_hyphen[1:]
        self.drops = []
        
    def __str__(self):
        return f'{self.name}'


# Reference for types and their plural forms
type_to_types_dict = {
    "accessory": "Accessories",
    "material": "Materials",
    "character": "Characters",
    "tool": "Tools",
}
    
# Templates for the different types of items
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
| found_in = <SOURCES>
| foundin_icon = <SOURCEHYPHENED>.png
}}The '''<NAME>''' is an [[Accessories|accessory]] in Moonbounce.

== Appearance ==
Lorem Ipsum

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
| found_in = <SOURCES>
| foundin_icon = <SOURCEHYPHENED>.png
}}The '''<NAME>''' is a [[Materials|material]] in Moonbounce.

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
| found_in = <SOURCES>
| foundin_icon = <SOURCEHYPHENED>.png
}}'''<NAME>''' is a [[Characters|character]] in Moonbounce.

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
| found_in = <SOURCES>
| foundin_icon = <SOURCEHYPHENED>.png
}}The '''<NAME>''' is a [[Tools|tool]] in Moonbounce.

== Appearance ==
Lorem Ipsum

== Trivia ==

* Lorem Ipsum

== Gallery ==

Placeholder
"""


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
        new_template = replace_text(new_template, '<SOURCES>', 'Nothing')
        new_template = replace_text(new_template, '<SOURCEHYPHENED>', 'X')
    else:
        new_template = replace_text(new_template, '<DROPS>', 'Yes')
        new_template = replace_text(new_template, '<SOURCES>', ', '.join([f"[[{source.name}]]" for source in item.sources]))
        new_template = replace_text(new_template, '<SOURCEHYPHENED>', item.sources[0].name_hyphen)
        
    # check if the item has a recipe
    new_template = replace_text(new_template, '<HAS_RECIPE>', has_recipe(item.name))
    
    return new_template

def load_data(data_path):
    """Load the data from the specified JSON file and populate the items and recipes lists."""
    
    # Initialize the lists to store the items, recipes, and sources
    items = []
    recipes = []
    sources = []
    
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)  
   
    # load the items and recipes into the items and recipes lists
    for item in data['items']:
        item_sources = []
        for source in item['sources']:
            drop_source = Source(source)
            item_sources.append(drop_source)
            if drop_source.name not in [source.name for source in sources]:
                sources.append(drop_source)
            
            # find the source in the sources list and add the item to its drops list
            for s in sources:
                if s.name == source:
                    s.drops.append(item['name'])
            
        
        items.append(Item(item['id'], item['name'], item['description'], item['type'], item['value'], item['rarity'], item_sources))
        
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


if __name__ == '__main__':
    # Initialize the lists to store the items, recipes, and sources
    items, recipes, sources = load_data(data_path)
    
    print(f'Loaded {len(items)} items and {len(recipes)} recipes.')
    print(f'Loaded {len(sources)} sources.')
    
    generate_wiki_articles(items)