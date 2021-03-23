// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({
	host: 'roller.cse.taylor.edu',
    //localhost if on LAN
    //port: 64279,
	username: 'The Slurp'
})
// Load your dependency plugins.
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

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
    BehaviorInteractBlock} = require("mineflayer-statemachine");
    
// wait for our bot to login.
bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};

    // Create our states
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    const getClosestCow = new BehaviorGetClosestEntity(bot, targets, EntityFilters().MobsOnly)
    const followCow = new BehaviorFollowEntity(bot, targets);
    const findWood = new BehaviorFindBlock (bot, targets)
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
            child: getClosestPlayer,
            shouldTransition: () => followCow.distanceToTarget() <= 1,
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