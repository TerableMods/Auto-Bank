module.exports = function AutoBank(mod) {
  const path = require('path');
  const BANK_CONTRACT = 26;
  const BANK_TYPE = 1;
  const BANK_PAGE_SLOTS = 72;
  const PAGE_CHANGE_TIMEOUT = 1000;
  const ERROR = '#ff0000';
  const BlacklistModes = Object.freeze({
    NONE: 0,
    REMOVE: 1,
    ADD: 2,
    ANY: 3})

  let disabled;
  let bankInventory;
  let currentContract;
  let onNextOffset;
  let blacklist = new Set();
  let blacklistMode = BlacklistModes.NONE;
  
  mod.dispatch.addDefinition('C_GET_WARE_ITEM', 3, path.join(__dirname, 'C_GET_WARE_ITEM.3.def'));

  loadConfig();

  if (disabled)
    return;

  mod.hook('S_REQUEST_CONTRACT', 1, event => {
    if (mod.game.me.is(event.senderId)) {
      currentContract = event.type;
    }
  });
  mod.hook('S_CANCEL_CONTRACT', 1, event => {
    if (mod.game.me.is(event.senderId)) {
      currentContract = null;
    }
  });

  mod.hook('S_VIEW_WARE_EX', 2, event => {
    if (!mod.game.me.is(event.gameId))
        return;
    
    if (event.container == BANK_TYPE) {
      currentContract = BANK_CONTRACT;
      bankInventory = event;
      if (onNextOffset) onNextOffset(event);
    }
  });
  mod.hook('C_GET_WARE_ITEM', 3, event => {
    tryBlacklistNext(event, false);
  });
  mod.hook('C_PUT_WARE_ITEM', 3, event => {
    tryBlacklistNext(event, true);
  });

  mod.command.add(['ab', 'autobank', 'bank'], {
    $default() {
      argsError();
    },
    human() {
      mod.settings.human = !mod.settings.human;
      saveConfig();
      msg('Human mode: ' + (mod.settings.human ? '<font color="#00FF00">Enabled</font>' : '<font color="#FF0000">Disabled</font>'));
    },
    tab() {
      if (checkDisabled()) return; 
      //deposit singe tab
      if (checkBankOpen()) {
        msg('Depositing items in: <font color="#FF00FF">Single Tab</font>');
        autoDeposit(false);
      }
    },
    all() {
      if (checkDisabled()) return;
      //deposit all tabs
      if (checkBankOpen()) {
        msg('Depositing items in: <font color="#00FFFF">All Tabs</font>');
        depositAllTabs();
      }
    },
    mode() {
      //update tab mode
      mod.settings.tab = !mod.settings.tab;
      saveConfig();
      msg('Single Tab mode: ' + (mod.settings.tab ? '<font color="#00FF00">Enabled</font>' : '<font color="#FF0000">Disabled</font>'));
    },
    blacklist(...args) {
      processBlacklistCommand(args);
    },
    bl(...args){
      processBlacklistCommand(args);
    },
    $none() {
      if (checkDisabled()) return;
      //deposit tab settings
      if (checkBankOpen()) {
        blacklistMode = BlacklistModes.NONE;
        msg('Depositing items in: ' + (mod.settings.tab ? '<font color="#FF00FF">Single Tab</font>' : '<font color="#00FFFF">All Tabs</font>'));
        if (mod.settings.tab) {
          autoDeposit(false);
        } else {
          depositAllTabs();
        }
      }
    }
  });

  function argsError() {
    msg('Invalid arguments', ERROR);
  }

  function checkDisabled() {
    if (disabled)
      msg('Auto Bank is disabled. Add the required files to the Toolbox data folder', ERROR);
    return disabled
  }

  function depositAllTabs() {
    if (bankInventory.offset != 0) {
      changeBankOffset(0, () => {
        autoDeposit(true);
      });
      return;
    }
    autoDeposit(true);
  }

  function processBlacklistCommand(args) {
    if (args.length >= 1) {
      switch (args[0]) {
        case 'a':
        case 'add':
          if (args.length == 1) {
            if (checkDisabled()) return;
            blacklistMode = blacklistMode ? BlacklistModes.NONE : BlacklistModes.ADD;
            msg(`<font color="#FFFF00">Next item you deposit or withdraw, will be</font> <font color="#FFFF00">added</font> <font color="#FFFF00">from the Blacklist</font>`);
          } else if (args.length == 2 && isNormalInteger(args[1])) {
            msg(`Item: <font color="#FF8000">${args[1]}</font> has been <font color="#FFFF00">added</font> to the Blacklist`);
            blacklist.add(args[1]);
            saveConfig();
          } else {
            argsError();
          }
          break;
        case 'r':
        case 'remove':            
          if (args.length == 1) {
            if (checkDisabled()) return;
            blacklistMode = blacklistMode ? BlacklistModes.NONE : BlacklistModes.REMOVE;
            msg(`<font color="#FFFF00">Next item you deposit or withdraw, will be</font> <font color="#FF0000">removed</font> <font color="#FFFF00">from the Blacklist</font>`);
          } else if (args.length == 2 && isNormalInteger(args[1])) {
            msg(`Item: <font color="#FF8000">${args[1]}</font> has been <font color="#FF0000">removed</font> from the Blacklist`);
            blacklist.add(args[1]);
            saveConfig();
          } else {
            argsError();
          }
          break;
        case 'mode':
          if (checkDisabled()) return;
          blacklistMode = blacklistMode ? BlacklistModes.NONE : BlacklistModes.ANY;
          if (blacklistMode) {
            msg('<font color="#FFFF00">Deposit an item now to be</font> <font color="#FFFF00">added</font> <font color="#FFFF00">to the Blacklist</font>');
			msg('<font color="#FFFF00">Withdraw an item now to be</font> <font color="#FF0000">removed</font> <font color="#FFFF00">from the Blacklist</font>');
            msg('Disable Blacklist mode using: <font color="#00FFFF">ab bl mode</font>');
          } else {
            msg('Blacklist mode: <font color="#FF0000">Disabled</font>');
          }
          break;
        case 'clear':
          msg('<font color="#00FF00">Blacklist was cleared</font>');
          blacklist.clear();
          saveConfig();
          break;
        case 'list':
          if (blacklist.size == 0) {
            msg('<font color="#FF0000">Blacklist is empty</font>');
          } else {
            msg('<font color="#FFAA00">Blacklisted items: </font>');
            for (let item of blacklist)
              msg(item);
          }
          break;
      }
    } else {
      argsError();
    }
  }

  function tryBlacklistNext(item, store) {
    if (blacklistMode == BlacklistModes.ADD || (blacklistMode == BlacklistModes.ANY && !store)) {
      blacklist.add(item.id);
      msg(`Item: <font color="#FF8000">${item.id}</font> has been <font color="#FFFF00">added</font> to the Blacklist`);
      saveConfig();
    } else if (blacklistMode == BlacklistModes.REMOVE || (blacklistMode == BlacklistModes.ANY && store)) {
      blacklist.delete(item.id);
      msg(`Item: <font color="#FF8000">${item.id}</font> has been <font color="#FF0000">removed</font> from the Blacklist`);
      saveConfig();
    }

    if (blacklistMode != BlacklistModes.ANY)
      blacklistMode = BlacklistModes.NONE;
  }

  function checkBankOpen() {
    if (currentContract != BANK_CONTRACT) {
      msg('Your Bank must be open to use Auto Bank', ERROR);
      return false;
    }

    return true;
  }

  function autoDeposit(allTabs) {
    let bagItems = mod.game.inventory.bagItems.slice(0);
    let bankItems = bankInventory.items.slice(0);

    bagItems.sort((a, b) => a.id - b.id);
    bankItems.sort((a, b) => a.id - b.id);
    let aIdx = 0;
    let bIdx = 0;

    let depositNext = function () {
      //find matching items to deposit
      while (aIdx < bagItems.length && bIdx < bankItems.length) {
        if (bagItems[aIdx].id === bankItems[bIdx].id) {
          if (currentContract != BANK_CONTRACT)
            return;
          if (!blacklist.has(bagItems[aIdx].id))
            depositItem(bagItems[aIdx], bankInventory.offset);
  
          aIdx++;
          bIdx++;

          setTimeout(() => {
            depositNext();
          }, getRandomDelay());
          return;
        } else if (bagItems[aIdx].id < bankItems[bIdx].id) {
          aIdx++;
        } else {
          bIdx++;
        }
      }

      if (allTabs) {
        let next = getNextOffset(bankInventory);
        if (next != undefined) {
          changeBankOffset(next, () => autoDeposit(allTabs));
        }
      }
    }

    depositNext();
  }

  function depositItem(bagItem, offset) {
    mod.send('C_PUT_WARE_ITEM', 3, {
      gameId: mod.game.me.gameId,
      container: BANK_TYPE,
      offset: offset,
      money: 0n,
      fromPocket: 0,
      fromSlot: bagItem.slot,
      id: bagItem.id,
      dbid: bagItem.dbid,
      amount: bagItem.amount,
      toSlot: offset
    });
  }

  function getNextOffset(bank) {
    let offset = bank.offset + BANK_PAGE_SLOTS;
    if (offset < bank.numUnlockedSlots)
      return offset;
  }

  function changeBankOffset(offset, callback) {
    let bankLoaded;
    onNextOffset = event => {
      bankLoaded = true;
      onNextOffset = false;
      callback(event);
    };
    
    setTimeout(() => {
      if (!bankLoaded)
        msg('Failed to load the next bank page', ERROR);
    }, PAGE_CHANGE_TIMEOUT);

    setTimeout(() => {
      mod.send('C_VIEW_WARE', 2, {
        gameId: mod.game.me.gameId,
        type: BANK_TYPE,
        offset: offset
      });
    }, getRandomDelay());
  }

  function loadConfig() {
    blacklist = new Set(mod.settings.blacklist);
  }

  function saveConfig() {
    mod.settings.blacklist = Array.from(blacklist);
    mod.saveSettings();
  }

  function getRandomDelay() {
    if (mod.settings.human) {
      return 300 + Math.floor(gaussianRand() * 200);
    } else {
      return 50 + Math.floor(Math.random() * 100);
    }
  }
  
  function gaussianRand() {
    let rand = 0;
    for (var i = 0; i < 6; i += 1) {
      rand += Math.random();
    }  
    return rand / 6;
  }

  function isNormalInteger(str) {
    let n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
  }

  function msg(text, color) {
    if (color !== undefined)
      mod.command.message(`<font color="${color}"> ${text}</font>`);
    else
      mod.command.message(` ${text}`); 
  }
};