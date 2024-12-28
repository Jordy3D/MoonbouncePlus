# open quests.json and remove a series of fields from each quest

import os
import json

quests = []


class Quest:
    # contains an id, a quest_id, availability_id, quest_name, quest_description, quest_instance_type, quest_quest_type, quest_tags (array), prerequisites (array containing required_quest_id), availbility (start and end epoch), recurring (boolean), recurring cooldown (hours), required_items (array containing item_id, quantity, and item_name), rewards (array containing item_id, quantity, item_name, and reward_type), and tags (array)
    # initilaise the class with the above attributes all set to None, an empty list, or false

    def __init__(
        self,
        quest_id=None,
        quest_name=None,
        quest_description=None,
        quest_instance_type=None,
        quest_quest_type=None,
        quest_tags=None,
        prerequisites=None,
        availability=None,
        recurring=None,
        recurring_cooldown=None,
        required_items=None,
        rewards=None,
        tags=None,
        trivia=None,
        promo=None,
    ):
        self.quest_id = quest_id
        self.quest_name = quest_name
        self.quest_description = quest_description
        self.quest_instance_type = quest_instance_type
        self.quest_quest_type = quest_quest_type
        self.quest_tags = quest_tags if quest_tags is not None else []
        self.prerequisites = prerequisites if prerequisites is not None else []
        self.availability = availability
        self.recurring = recurring
        self.recurring_cooldown = recurring_cooldown
        self.required_items = required_items if required_items is not None else []
        self.rewards = rewards if rewards is not None else []
        self.tags = tags if tags is not None else []

        self.trivia = trivia
        self.promo = promo

    def __str__(self):
        output = f"{self.quest_name}"  # ({self.quest_id})'
        if self.quest_instance_type:
            output += f" - {self.quest_instance_type}"
        if self.quest_quest_type:
            output += f" - {self.quest_quest_type}"

        output += "\nRequired Items\n"
        for item in self.required_items:
            output += f"  {item}\n"
        output += "Rewards\n"
        for reward in self.rewards:
            output += f"  {reward}\n"

        return output


class QuestRequiredItem:
    def __init__(self, item_id=None, quantity=None, item_name=None):
        self.item_id = item_id
        self.quantity = quantity
        self.item_name = item_name

    def __str__(self):
        return f"{self.item_name} x{self.quantity}"


quest_mp_sizes = {
    500: "Small",
    2000: "Medium",
    2500: "Medium",
    3000: "Large",
    5000: "Large",
}


class QuestReward:
    def __init__(
        self,
        item_id=None,
        reward_type=None,
        item_name=None,
        quantity=None,
        recipe_name=None,
    ):
        self.item_id = item_id
        self.reward_type = reward_type
        self.item_name = item_name
        self.quantity = quantity
        self.recipe_name = recipe_name

        self.clean_name = None

    def get_clean_name(self):
        # Change the Clean Name based on the Reward Type
        if self.reward_type == "item":
            self.clean_name = self.item_name
        elif self.reward_type == "recipe":
            self.clean_name = f"{self.recipe_name} Recipe"
        elif self.reward_type == "quest":
            self.clean_name = "New Quest!"
        elif self.reward_type == "currency":
            self.clean_name = f"{self.quantity} MP"
        else:
            self.clean_name = "Unknown Reward Type: " + self.reward_type

        return self.clean_name

    def __str__(self):
        self.get_clean_name()
        return self.clean_name


def clean_quests(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:

        data = json.load(f)

        for quest in data:
            # del quest["id"]
            del quest["user_id"]
            del quest["granted_on"]
            del quest["activated_on"]
            del quest["end_type"]
            del quest["progress"]
            del quest["availability_id"]

            for item in quest["required_items"]:
                del item["collected"]
                del item["item_details"]

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)


def load_quests(input_file):

    # load the wiki data
    with open("data/wiki_data.json", "r", encoding="utf-8") as f:
        wiki_data = json.load(f)

    wiki_data = wiki_data["quests"]

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

        for quest in data:
            new_quest = Quest()

            new_quest.quest_id = quest["quest_id"]
            new_quest.quest_name = quest["quest_name"]
            new_quest.quest_description = quest["quest_description"]
            new_quest.quest_instance_type = quest["quest_instance_type"]
            new_quest.quest_quest_type = quest["quest_quest_type"]

            new_quest.quest_tags = quest["quest_tags"]

            # if prerequisites is not an empty list
            if quest["prerequisites"] != []:
                # find all the strings values in the prerequisites list
                new_quest.prerequisites = quest["prerequisites"]

            # find the start_date and end_date values in the availability list
            new_quest.availability = (
                quest["availability"][0]["start_date"],
                quest["availability"][0]["end_date"],
            )

            new_quest.recurring = quest["recurring"]
            if quest["recurring"]:
                new_quest.recurring_cooldown = quest["recurring"][0][
                    "cooldown_period_in_hours"
                ]

            if quest["required_items"]:
                # get the item_id, quantity, and item_name values from the required_items list
                required_items = []
                for item in quest["required_items"]:
                    new_item = QuestRequiredItem()
                    new_item.item_id = item["item_id"]
                    new_item.quantity = item["quantity"]
                    new_item.item_name = item["item_name"]

                    required_items.append(new_item)

                new_quest.required_items = required_items

            if quest["rewards"]:
                # get the item_id, quantity, item_name, and reward_type values from the rewards list
                rewards = []
                for reward in quest["rewards"]:
                    new_reward = QuestReward()
                    new_reward.item_id = reward["item_id"]
                    new_reward.quantity = reward["quantity"]
                    new_reward.item_name = reward["item_name"]
                    new_reward.reward_type = reward["reward_type"]
                    new_reward.recipe_name = reward["recipe_name"]

                    rewards.append(new_reward)

                new_quest.rewards = rewards

            new_quest.tags = quest["tags"]

            # add the trivia and promo fields
            # find the quest with the matching name
            wiki_quest = next(
                (q for q in wiki_data if q["name"] == new_quest.quest_name.strip()),
                None,
            )
            if wiki_quest:
                new_quest.trivia = wiki_quest["trivia"]
                new_quest.promo = wiki_quest["promo"]

            quests.append(new_quest)

        return quests


def convert_to_json(obj):
    if isinstance(obj, Quest):
        return {
            "quest_id": obj.quest_id,
            "quest_name": obj.quest_name,
            "quest_description": obj.quest_description,
            "quest_instance_type": obj.quest_instance_type,
            "quest_quest_type": obj.quest_quest_type,
            "quest_tags": obj.quest_tags,
            "prerequisites": obj.prerequisites,
            "availability": [
                {"start_date": obj.availability[0], "end_date": obj.availability[1]}
            ],
            "recurring": (
                [{"cooldown_period_in_hours": obj.recurring_cooldown}]
                if obj.recurring
                else None
            ),
            "required_items": [
                {
                    "item_id": item.item_id,
                    "item_name": item.item_name,
                    "quantity": item.quantity,
                }
                for item in obj.required_items
            ],
            "rewards": [
                {
                    "item_id": reward.item_id,
                    "item_name": reward.item_name,
                    "quantity": reward.quantity,
                    "reward_type": reward.reward_type,
                    "recipe_name": reward.recipe_name,
                }
                for reward in obj.rewards
            ],
            "tags": obj.tags,
        }
    elif isinstance(obj, QuestRequiredItem):
        return {
            "item_id": obj.item_id,
            "quantity": obj.quantity,
            "item_name": obj.item_name,
        }
    elif isinstance(obj, QuestReward):
        return {
            "item_id": obj.item_id,
            "quantity": obj.quantity,
            "item_name": obj.item_name,
            "reward_type": obj.reward_type,
            "recipe_name": obj.recipe_name,
        }
    else:
        return obj


quest_template = """\
[[Category:Quests]]<PROMOCATEGORY>
{{{{Quest
|name={quest_name}
|description={quest_description}
|instance_type={quest_instance_type}
|quest_type={quest_quest_type}
|prerequisites={prerequisites}
|required_items={required_items}
|rewards={rewards}
}}}}"""

quest_page_template = """<QUEST>

<NAME> is <INSTANCE_TYPE> <QUEST_TYPE> [[Quest]] in Moonbounce.

== Description ==

<DESCRIPTION>

<PREREQUISITES>

<REQUIRED>

<REWARDS>

"""

reward_card_template = """\
{{Card
|title=<NAME>
|image=<IMAGE>.png
|linktarget=<NAMEHYPHENED>
}}
"""


# the prerequisites, required_items, and rewards fields are lists of dictionaries
# the prerequisites should find the quest name from the quest_id
# the required_items should list the item name and quantity
# the rewards should list the clean name
def convert_to_mediawiki(obj):
    if isinstance(obj, Quest):
        prerequisites = []
        for prerequisite in obj.prerequisites:
            # find the quest with the matching quest_id
            prerequisite_quest = next(
                (quest for quest in quests if quest.quest_id == prerequisite), None
            )
            if prerequisite_quest:
                prerequisites.append(prerequisite_quest.quest_name)

        required_items = []
        for item in obj.required_items:
            required_items.append(f"{item.item_name} x{item.quantity}")

        rewards = []
        for reward in obj.rewards:
            rewards.append(f"{reward.get_clean_name()}")

        return quest_template.format(
            quest_name=obj.quest_name,
            quest_description=obj.quest_description,
            quest_instance_type=obj.quest_instance_type,
            quest_quest_type=obj.quest_quest_type,
            prerequisites=", ".join(prerequisites),
            required_items=", ".join(required_items),
            rewards=", ".join(rewards),
        )
    elif isinstance(obj, QuestRequiredItem):
        return f"{obj.item_name} x{obj.quantity}"
    elif isinstance(obj, QuestReward):
        return f"{obj.get_clean_name()}"
    else:
        return obj


def create_quest_pages(quests):
    for quest in quests:
        page = ""

        # replace the placeholders in the quest_page_template with the quest values
        page = quest_page_template.replace("<QUEST>", convert_to_mediawiki(quest))
        page = page.replace("<NAME>", quest.quest_name)
        page = page.replace("<INSTANCE_TYPE>", quest.quest_instance_type)
        page = page.replace("<QUEST_TYPE>", quest.quest_quest_type)
        page = page.replace("<DESCRIPTION>", quest.quest_description)

        # replace the <PROMOCATEGORY> placeholder with the promo category
        is_promo = quest.promo
        promo_category = "[[Category:Promos]]" if is_promo else ""
        page = page.replace("<PROMOCATEGORY>", "[[Category:Promos]]")

        if quest.prerequisites:
            prerequisites = "== Prerequisites ==\n\n"
            for prerequisite in quest.prerequisites:

                prereq_quest = next(
                    (q for q in quests if q.quest_id == prerequisite), None
                )

                prerequisites += f"* [[{prereq_quest.quest_name}]]\n"
            page = page.replace("<PREREQUISITES>", prerequisites)
        else:
            page = page.replace("<PREREQUISITES>", "")

        if quest.required_items:
            required_items = "== Required Items ==\n\n"
            required_items += '<div class="card-container left-align">\n'
            for item in quest.required_items:
                # these are always items
                required_items += reward_card_template.replace(
                    "<NAME>", f"{item.item_name} x{item.quantity}"
                )
                required_items = required_items.replace(
                    "<NAMEHYPHENED>", f"{item.item_name.replace(' ', '_')}"
                )
                required_items = required_items.replace(
                    "<IMAGE>", f"{item.item_name.replace(' ', '_')}"
                )
            required_items += "</div>"

            page = page.replace("<REQUIRED>", required_items)
        else:
            page = page.replace("<REQUIRED>", "")

        if quest.rewards:
            rewards = "== Rewards ==\n\n"
            rewards += '<div class="card-container left-align">\n'
            for reward in quest.rewards:
                # if the reward is an item
                if reward.reward_type == "item":
                    rewards += reward_card_template.replace("<NAME>", reward.item_name)
                    rewards = rewards.replace(
                        "<NAMEHYPHENED>", reward.item_name.replace(" ", "_")
                    )
                    rewards = rewards.replace(
                        "<IMAGE>", reward.item_name.replace(" ", "_")
                    )

                # if the reward is a recipe
                elif reward.reward_type == "recipe":
                    rewards += reward_card_template.replace(
                        "<NAME>", f"{reward.recipe_name} Recipe"
                    )
                    rewards = rewards.replace(
                        "<NAMEHYPHENED>", f"{reward.recipe_name}_Recipe"
                    )
                    rewards = rewards.replace("<IMAGE>", f"Recipe_Sheet")
                # if the reward is a quest
                elif reward.reward_type == "quest":
                    rewards += reward_card_template.replace("<NAME>", "New Quest!")
                    rewards = rewards.replace("<NAMEHYPHENED>", "Quests")
                    rewards = rewards.replace("<IMAGE>", "Quest")
                # if the reward is currency
                elif reward.reward_type == "currency":
                    # determine the size of the currency reward
                    # find the key that matches the quantity
                    currency_size = reward.quantity
                    for key in quest_mp_sizes:
                        if reward.quantity <= key:
                            currency_size = quest_mp_sizes[key]
                            break

                    rewards += reward_card_template.replace(
                        "<NAME>", f"{reward.quantity} MP"
                    )
                    rewards = rewards.replace("<NAMEHYPHENED>", "Quests")
                    rewards = rewards.replace("<IMAGE>", f"MP_{currency_size}")
                else:
                    rewards += reward_card_template.replace("<NAME>", "Unknown Reward")
                    rewards = rewards.replace("<NAMEHYPHENED>", "Quests")
                    rewards = rewards.replace("<IMAGE>", "Quest.png")
            rewards += "</div>"

            page = page.replace("<REWARDS>", rewards)
        else:
            page = page.replace("<REWARDS>", "")

        if quest.trivia:
            trivia = "== Trivia ==\n\n"
            trivia += "\n".join(quest.trivia)

            page += trivia

        # remove any multiple newlines
        while "\n\n\n" in page:
            page = page.replace("\n\n\n", "\n")

        # make the quests folder if it doesn't exist
        if not os.path.exists("wiki/quests"):
            os.makedirs("wiki/quests")

        # remove ? from the quest name
        quest.quest_name = quest.quest_name.replace("?", "")

        # save the pages in the data/quests/pages folder
        with open(f"wiki/quests/{quest.quest_name}.mw", "w", encoding="utf-8") as f:
            f.write(page)


def sort_quests(quests):
    # sort the quests by quest_name, but adjust the order so that the quests with prerequisites come after the quests they require
    sorted_quests = []
    # first, sort the quests by quest_name and put in only the quests with no prerequisites
    sorted_quests += sorted(
        [quest for quest in quests if not quest.prerequisites],
        key=lambda x: x.quest_name,
    )
    # then, add the quests with prerequisites after the quests they require
    for quest in quests:
        if quest.prerequisites:
            # find the index of the prerequisite quest
            index = next(
                (
                    i
                    for i, q in enumerate(sorted_quests)
                    if q.quest_id == quest.prerequisites[0]
                ),
                None,
            )
            # insert the quest after the prerequisite quest
            sorted_quests.insert(index + 1, quest)

    return sorted_quests


def print_quests_with_deeper_bullets(quests):
    print("== Quest List ==")

    for quest in quests:
        bullet = "*"
        quest_name = quest.quest_name
        current_quest = quest

        while current_quest.prerequisites:
            bullet += "*"
            current_quest = next(
                (q for q in quests if q.quest_id == current_quest.prerequisites[0]),
                None,
            )

        print(f"{bullet} [[{quest_name}]]")


if __name__ == "__main__":

    # clean_quests("quests/questsfull.json", "quests/cleaned_quests.json")
    quests = load_quests("data/quests.json")

    # sort the quests
    quests = sort_quests(quests)

    print("\n\n")

    for quest in quests:
        print(quest)

    # save the Quests to a new JSON file called quests.json
    quest_object = [convert_to_json(quest) for quest in quests]

    with open("data/quests.json", "w", encoding="utf-8") as f:
        json.dump(quest_object, f, indent=4)

    # save the Quests to a new MediaWiki file called quests.mw
    quest_object = [convert_to_mediawiki(quest) for quest in quests]

    with open("wiki/quests.mw", "w", encoding="utf-8") as f:
        for quest in quest_object:
            f.write(quest + "\n\n")

    # create the individual quest pages
    create_quest_pages(quests)

    print_quests_with_deeper_bullets(quests)
