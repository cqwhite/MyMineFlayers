// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({
//	host: 'roller.cse.taylor.edu',
    //if LAN
 // host: 'locahost',
  port: 60343,
	username: 'The Slurpsss'
})

const { performance } = require('perf_hooks')
// Load your dependency plugins.
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
const minecraftHawkEye = require('minecrafthawkeye')


let mcData
bot.on('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

// Import required behaviors.
const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine, 
    BehaviorFindBlock,
    StateMachineWebserver,
    BehaviorMineBlock,
    BehaviorPlaceBlock,
    BehaviorInteractBlock} = require("mineflayer-statemachine");

    let nowFishing = false
    function onCollect (player, entity) {
      if (entity.kind === 'Drops' && player === bot.entity) {
        bot.removeListener('playerCollect', onCollect)
        startFishing()
      }
    }


    const startfishState = (function(){
      function FishState(bot)
      {
          this.bot = bot;
          this.active = false;
          this.stateName = 'FishState';
      }
  
      FishState.prototype.onStateEntered = function () {
          console.log(`${bot.username} has entered the ${this.stateName} state.`);
          bot.chat('Fishing')
          bot.equip(mcData.itemsByName.fishing_rod.id, 'hand', (err) => {
            if (err) {
              return bot.chat(err.message)
            }
        
            nowFishing = true
            bot.on('playerCollect', onCollect)
        
            bot.fish((err) => {
              nowFishing = false
        
              if (err) {
                bot.chat(err.message)
              }
            })
          })
          
      };
      FishState.prototype.onStateExited = function () {
          console.log(`${bot.username} has left the ${this.stateName} state.`);
      };
  
      return FishState;
  }());

  const stopfishState = (function(){
    function StopFishState(bot)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'StopFishState';
    }

    StopFishState.prototype.onStateEntered = function () {
        console.log(`${bot.username} has entered the ${this.stateName} state.`);
        bot.removeListener('playerCollect', onCollect)

        if (nowFishing) {
          bot.activateItem()
        }
        
    };
    StopFishState.prototype.onStateExited = function () {
        console.log(`${bot.username} has left the ${this.stateName} state.`);
    };

    return StopFishState;
}());

const findrockstate = (function(){
  function FindRockState(bot)
  {
      this.bot = bot;
      this.active = false;
      this.stateName = 'FindRockState';
  }

  FindRockState.prototype.onStateEntered = function () {
      console.log(`${bot.username} has entered the ${this.stateName} state.`);

      const name = 'stone'
        if (mcData.blocksByName[name] === undefined) {
          bot.chat(`${name} is not a block name`)
          return
        }
        const ids = [mcData.blocksByName[name].id]
    
        const startTime = performance.now()
        const blocks = bot.findBlocks({ matching: ids, maxDistance: 128, count: 10 })
        const time = (performance.now() - startTime).toFixed(2)
    
        bot.chat(`I found ${blocks.length} ${name} blocks in ${time} ms`)   
      
  };
  FindRockState.prototype.onStateExited = function () {
      console.log(`${bot.username} has left the ${this.stateName} state.`);
  };

  return FindRockState;
}());

const hawkeyebotstate = (function(){
  function HawkeyeBotState(bot)
  {
      this.bot = bot;
      this.active = false;
      this.stateName = 'HawkeyeBotState';
  }

  HawkeyeBotState.prototype.onStateEntered = function () {
      console.log(`${bot.username} has entered the ${this.stateName} state.`);

        bot.chat('/give ' + bot.username + ' bow{Enchantments:[{id:unbreaking,lvl:100}]} 1')
          bot.chat('/give ' + bot.username + ' minecraft:arrow 300')
          bot.chat('/time set day')
          bot.chat('/kill @e[type=minecraft:arrow]')

          bot.chat('Ready!')

          // Get target for block position, use whatever you need
          const target = bot.hawkEye.
          console.log(target)
          if (!target) {
            return false
          }

          // Auto attack every 1,2 secs until target is dead or is to far away
          bot.hawkEye.autoAttack(target)
      
  };
  HawkeyeBotState.prototype.onStateExited = function () {
      console.log(`${bot.username} has left the ${this.stateName} state.`);
  };

  return HawkeyeBotState;
}());

      
// wait for our bot to login.
bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};

    // Create our states
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    const getClosestCow = new BehaviorGetClosestEntity(bot, targets, EntityFilters().MobsOnly);
    const followCow = new BehaviorFollowEntity(bot, targets);
    const getClosestItem = new BehaviorGetClosestEntity(bot, targets, EntityFilters().ItemDrops);
    const followItem = new BehaviorFollowEntity(bot, targets);
    const startFishing = new startfishState(bot, targets);
    const stopFishing = new stopfishState(bot, targets);
    const findBlock = new findrockstate(bot, targets);
    const hawkEyeMode = new hawkeyebotstate(bot, targets);
    // Create our transitions
    const transitions = [
        //find closest mob
      
        new StateTransition({
            parent: getClosestCow,
            child: followCow,
            shouldTransition: () => true,
        }),
        //go to that mob, when it is within 1 block, leave to the nearest player
        
        new StateTransition({
            parent: followCow,
            child: getClosestItem,
            shouldTransition: () => followCow.distanceToTarget() <= 3,
        }),
        //get closest item time
        new StateTransition({
          parent: getClosestItem,
          child: followItem,
          shouldTransition: () => true,
        }),

          new StateTransition({
            parent: followItem,
            child: startFishing,
            shouldTransition: () => followItem.distanceToTarget() <= 1,
        }),
    //fishing time
          new StateTransition({
            parent: startFishing,
            child: stopFishing,
            shouldTransition: () => bot.health <= 8,
        }),

          new StateTransition({
            parent: stopFishing,
            child: findBlock,
            shouldTransition: () => true,
          }),

          new StateTransition({
            parent: findBlock,
            child: getClosestPlayer,
            shouldTransition: () => true,
          }),

          // We want to start following the player immediately after finding them.
        // Since getClosestPlayer finishes instantly, shouldTransition() should always return true.
        
        new StateTransition({
            parent: getClosestPlayer,
            child: followPlayer,
            shouldTransition: () => true,
        }),

        

        // If the distance to the player is less than two blocks, switch from the followPlayer
        // state to the lookAtPlayer state.
        new StateTransition({
            parent: followPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        // If the distance to the player is more than two blocks, switch from the lookAtPlayer
        // state to the followPlayer state.
        new StateTransition({
            parent: lookAtPlayer,
            child: followPlayer,
            shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2,
        }),
    ];

    // Now we just wrap our transition list in a nested state machine layer. We want the bot
    // to start on the getClosestCow state, so we'll specify that here.
    const rootLayer = new NestedStateMachine(transitions, getClosestCow);
    
    // We can start our state machine simply by creating a new instance.
    new BotStateMachine(bot, rootLayer);

    const stateMachine = new BotStateMachine(bot, rootLayer);


    const port = 8080;
    const webserver = new StateMachineWebserver(bot, stateMachine, port);
    webserver.startServer();


});