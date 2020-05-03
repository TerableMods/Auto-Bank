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

_Open your Bank window **before** using the commands below_

- **ab** or **autobank** or **bank**
  - to begin auto depositing items to the bank (Default All Tabs)

- **ab mode**
  - to toggle depositing modes Single Tab/All Tabs (Default All Tabs)

- **ab tab**
  - to deposit items in the current bank tab only (Single Tab)

- **ab all**
  - to deposit items in all bank tabs (All Tabs)

- **ab human**
  - to toggle Human-like delays ON/OFF (Default OFF)

- **ab bl add**
  - deposit or withdraw a single item to be added to the Blacklist

- **ab bl add [itemID]**
  - enter the ID number of the item you want added to the Blacklist

- **ab bl remove**
  - deposit or withdraw a single item to be removed from the Blacklist

- **ab bl remove [itemID]**
  - enter the ID number of the item you want removed from the Blacklist

- **ab bl clear**
  - to clear all items from the Blacklist

- **ab bl mode**
  - to toggle Blacklisting mode ON/OFF
  - when *bl mode* is active: all items *withdrawn* from the bank, are **added** to the Blacklist
  - when *bl mode* is active: all items *deposited* in the bank, will be **removed** from the Blacklist

---

## Notes:

- Items will **only** be auto deposited from your inventory, if the same item already exists in your bank
- Items in your Blacklist will never be auto deposited
- Items in your *Pocket Tab* section will be ignored

---

Patch Version: **93.3**