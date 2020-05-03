## Info:

- Auto deposits items into the Bank.

---

## Install:

- Opcode for **C_GET_WARE_ITEM** must be mapped for your region
  - NA patch **93.3** = [protocol.367405.map](https://github.com/TerableMods/OP-codez)

- The *.map* file containing your region specific opcodes, must be placed inside of:
> TeraToolbox\data\opcodes

---

## Commands:

- **ab** or **autobank** or **bank**
  - to begin auto depositing items to the bank (Default All Tabs)
  - *(Your Bank window must be open before using this command)*
  
- **ab mode**
  - to toggle the default depositing mode to Single Tab or All Tabs (Default All Tabs)

- **ab tab**
  - to begin depositing items in the currently opened bank tab only (Single Tab)
  - *(Your Bank window must be open before using this command)*

- **ab all**
  - to begin depositing items in all bank tabs (All Tabs)
  - *(Your Bank window must be open before using this command)*

- **ab human**
  - to toggle Human-like delays ON/OFF (Default OFF)

- **ab bl a**
  - deposit or withdraw a single item to add it to the Blacklist

- **ab bl a [itemID]**
  - enter the ID number of the item you want added to the Blacklist
  - Example: **ab bl a 6552** would add itemID 6552 to the blacklist ([Prime Recovery Potable](https://teralore.com/us/item/6552/))

- **ab bl r**
  - deposit or withdraw a single item to be removed from the Blacklist

- **ab bl r [itemID]**
  - enter the ID number of the item you want removed from the Blacklist
  - Example: **ab bl r 6552** would remove item 6552 from the blacklist ([Prime Recovery Potable](https://teralore.com/us/item/6552/)) 

- **ab bl clear**
  - to clear all items from the Blacklist

- **ab bl mode**
  - to toggle Blacklist mode ON/OFF
  - when Blacklist mode is active: all items *withdrawn* from the bank, are **added** to the Blacklist
  - when Blacklist mode is active: all items *deposited* in the bank, will be **removed** from the Blacklist

---

## Notes:

- Items will **only** be auto deposited from your inventory, if the same item already exists in your bank
- Items in your Blacklist will never be auto deposited
- Items in your *Pocket Tab* section will be ignored
- Items in your inventory using more than one space (multiple stacks), only 1 stack will be deposited at a time
  - (you can run the command again to deposit the next stack)

---

### Issues:

- While blacklisting (add or remove), **withdrawing** an item is retrieving incorrect/different itemIDs
  - *but depositing an item to the Bank is working as intended (retrieving the correct itemIDs)*

---

Patch Version: **93.3**