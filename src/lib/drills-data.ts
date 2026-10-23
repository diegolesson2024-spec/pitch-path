// Drill library seeded into the database. Coaches can attach any of these to a plan.

export type DrillSeed = {
  name: string;
  skill: string;
  category: string;
  summary: string;
  instructions: string;
  equipment: string;
  minutes: number;
  difficulty: "Foundation" | "Developing" | "Advanced";
  atHome?: boolean;
};

export const DRILLS: DrillSeed[] = [
  {
    name: "Wall Pass Rhythm",
    skill: "firstTouch",
    category: "TECHNICAL",
    summary: "Receive off a wall and take the first touch out of your feet.",
    instructions:
      "Stand 3-5m from a wall. Pass with your right, control with your left into space, then pass with your left. Count clean first touches out of 50. Move further back as you improve.",
    equipment: "Ball, wall",
    minutes: 12,
    difficulty: "Foundation",
  },
  {
    name: "Juggling Ladder",
    skill: "firstTouch",
    category: "TECHNICAL",
    summary: "Build soft touch with feet, thighs and head.",
    instructions:
      "Keep the ball up and record your best run. Then do rounds: 10 touches right foot only, 10 left only, 10 alternating, 5 thigh-foot combos. Write down your record every session.",
    equipment: "Ball",
    minutes: 10,
    difficulty: "Foundation",
  },
  {
    name: "Receive Across the Body",
    skill: "firstTouch",
    category: "TECHNICAL",
    summary: "Open your body and receive on the back foot.",
    instructions:
      "Set two cones 2m apart as a gate. A partner or wall plays the ball in. Receive with your back foot through the gate and pass out the other side. 3 sets of 10 each direction.",
    equipment: "Ball, 2 cones, wall or partner",
    minutes: 12,
    difficulty: "Developing",
  },
  {
    name: "Target Gates",
    skill: "passing",
    category: "TECHNICAL",
    summary: "Accurate passing through small gates at different distances.",
    instructions:
      "Set three 1m gates at 5m, 10m and 15m. Pass 10 balls through each gate with each foot. Record how many go through. Use the inside of the foot and lock the ankle.",
    equipment: "Ball, 6 cones",
    minutes: 15,
    difficulty: "Foundation",
  },
  {
    name: "One-Two Triangle",
    skill: "passing",
    category: "TECHNICAL",
    summary: "Quick combination play with movement after the pass.",
    instructions:
      "With a partner, set a 6m triangle of cones. Pass and move to the free cone each time. Two-touch for 2 minutes, then one-touch. 4 rounds with rest between.",
    equipment: "Ball, 3 cones, partner",
    minutes: 15,
    difficulty: "Developing",
    atHome: false,
  },
  {
    name: "Driven Pass Challenge",
    skill: "passing",
    category: "TECHNICAL",
    summary: "Strike a firm, low pass over 20m.",
    instructions:
      "Pass to a partner or target 20m away. Laces, knee over the ball, follow through low. Score 2 points for a pass that stays below knee height and reaches the target.",
    equipment: "Ball, target or partner",
    minutes: 12,
    difficulty: "Advanced",
  },
  {
    name: "Cone Slalom",
    skill: "dribbling",
    category: "TECHNICAL",
    summary: "Close control at speed through a line of cones.",
    instructions:
      "Set 8 cones 1m apart. Dribble through using inside, outside and sole. Time 5 runs and record your best. Use both feet.",
    equipment: "Ball, 8 cones, stopwatch",
    minutes: 12,
    difficulty: "Foundation",
  },
  {
    name: "1v1 Moves Library",
    skill: "dribbling",
    category: "TECHNICAL",
    summary: "Master three moves to beat a defender.",
    instructions:
      "Practise a step-over, a drag-back and a body feint at a cone 'defender'. 10 reps of each move each foot, then explode away for 5m after every move.",
    equipment: "Ball, cone",
    minutes: 15,
    difficulty: "Developing",
  },
  {
    name: "Box Dribble Under Pressure",
    skill: "dribbling",
    category: "TECHNICAL",
    summary: "Keep the ball in a tight space while a partner chases.",
    instructions:
      "In a 6x6m box, keep the ball away from a partner for 30 seconds. Swap roles. Use the body to shield, keep your head up. 6 rounds.",
    equipment: "Ball, 4 cones, partner",
    minutes: 12,
    difficulty: "Advanced",
    atHome: false,
  },
  {
    name: "Corners of the Goal",
    skill: "finishing",
    category: "TECHNICAL",
    summary: "Place shots into the corners instead of blasting.",
    instructions:
      "Mark the bottom corners of a goal (or wall) with cones. From 12m, take 20 shots aiming for the corners. Count on-target shots that hit a corner zone.",
    equipment: "Ball(s), goal or wall, 2 cones",
    minutes: 15,
    difficulty: "Foundation",
  },
  {
    name: "Touch and Finish",
    skill: "finishing",
    category: "TECHNICAL",
    summary: "Set the ball with one touch and shoot with the next.",
    instructions:
      "Roll or receive the ball, take one touch out of your feet to the side, then shoot. Alternate sides. 3 sets of 8. Focus on getting the set-up touch right.",
    equipment: "Ball, goal or wall",
    minutes: 15,
    difficulty: "Developing",
  },
  {
    name: "Weak Foot Week",
    skill: "weakFoot",
    category: "TECHNICAL",
    summary: "Every touch on your weaker foot for one session.",
    instructions:
      "Wall passes, juggling and dribbling, all on the weaker foot only. Start with 50 wall passes and track how many are clean. Add 10 more each session.",
    equipment: "Ball, wall",
    minutes: 15,
    difficulty: "Foundation",
  },
  {
    name: "Mirror Finishing",
    skill: "weakFoot",
    category: "TECHNICAL",
    summary: "Repeat every finish on both feet.",
    instructions:
      "For every shot you take with your strong foot, take the same shot with your weaker foot. 10 pairs. Record weak-foot shots on target.",
    equipment: "Ball, goal or wall",
    minutes: 12,
    difficulty: "Developing",
  },
  {
    name: "Shoulder Check Colours",
    skill: "scanning",
    category: "TACTICAL",
    summary: "Look over your shoulder before every touch.",
    instructions:
      "A parent or teammate stands behind you holding up coloured cones or fingers. Before each pass from the wall arrives, check your shoulder and call out what you saw. 3 sets of 20.",
    equipment: "Ball, wall, coloured cones, helper",
    minutes: 10,
    difficulty: "Foundation",
  },
  {
    name: "Head Up Rondo",
    skill: "scanning",
    category: "TACTICAL",
    summary: "4v1 keep-ball where you must scan before receiving.",
    instructions:
      "In a 10x10m square, four players keep the ball from one defender. A pass only counts if the receiver checked a shoulder first. Rotate the defender every minute.",
    equipment: "Ball, 4 cones, 5 players",
    minutes: 15,
    difficulty: "Developing",
    atHome: false,
  },
  {
    name: "Match Film Review",
    skill: "decisionMaking",
    category: "TACTICAL",
    summary: "Watch three clips and pick the better option.",
    instructions:
      "With a parent, watch three short clips from a professional game. Pause before the pass and say what you would do and why. Compare to what happened. Write one lesson down.",
    equipment: "Video device",
    minutes: 15,
    difficulty: "Foundation",
  },
  {
    name: "Pass or Dribble Gates",
    skill: "decisionMaking",
    category: "TACTICAL",
    summary: "React to a visual cue and choose the right action.",
    instructions:
      "A helper raises a red or blue cone as you approach. Red = pass to the target, Blue = dribble through the gate. 20 reps, then shorten the reaction time.",
    equipment: "Ball, cones, helper",
    minutes: 12,
    difficulty: "Developing",
  },
  {
    name: "Find the Pocket",
    skill: "attackingMovement",
    category: "TACTICAL",
    summary: "Move into space between two defenders to receive.",
    instructions:
      "Set two cones as 'defenders' 4m apart. Start behind them, check away, then step into the gap to receive a pass. Turn and play forward. 3 sets of 10.",
    equipment: "Ball, 2 cones, helper or wall",
    minutes: 12,
    difficulty: "Developing",
  },
  {
    name: "Shadow Defending",
    skill: "defensivePositioning",
    category: "TACTICAL",
    summary: "Practise body shape: side-on, low, patient.",
    instructions:
      "A partner dribbles slowly towards you. Stay side-on, knees bent, and show them onto their weaker side. Don't dive in. 10 reps each side, then speed up.",
    equipment: "Ball, partner",
    minutes: 10,
    difficulty: "Foundation",
  },
  {
    name: "Recovery Run Race",
    skill: "defensivePositioning",
    category: "TACTICAL",
    summary: "Sprint back goal-side after losing the ball.",
    instructions:
      "Start 5m ahead of a cone 'attacker'. On a call, turn and sprint back to get between the cone and the goal line 15m away. 8 reps, full recovery between.",
    equipment: "Cones",
    minutes: 10,
    difficulty: "Developing",
  },
  {
    name: "Five-Second Press",
    skill: "pressing",
    category: "TACTICAL",
    summary: "React instantly when the ball is lost.",
    instructions:
      "In small-sided games, when your team loses the ball, everyone nearby presses for five seconds. Coach or parent counts reactions. Aim to be the first player to press.",
    equipment: "Small-sided game",
    minutes: 15,
    difficulty: "Developing",
    atHome: false,
  },
  {
    name: "Acceleration Starts",
    skill: "speed",
    category: "PHYSICAL",
    summary: "Explosive first five steps from different starts.",
    instructions:
      "Sprint 10m from standing, kneeling, lying face down and backwards-facing starts. 2 of each. Walk back for full recovery. Time one 10m sprint per session.",
    equipment: "Cones, stopwatch",
    minutes: 12,
    difficulty: "Foundation",
  },
  {
    name: "Flying 20s",
    skill: "speed",
    category: "PHYSICAL",
    summary: "Build top speed with a run-in zone.",
    instructions:
      "Jog 10m, build up over 10m, then sprint flat out for 20m. 5 reps with 90 seconds rest. Record your best 20m time once a week.",
    equipment: "Cones, stopwatch",
    minutes: 15,
    difficulty: "Developing",
  },
  {
    name: "Ladder Feet",
    skill: "agility",
    category: "PHYSICAL",
    summary: "Quick feet through ladder patterns.",
    instructions:
      "Using a ladder or chalk lines: two feet in each box, lateral in-in-out-out, and hopscotch. 3 rounds of each pattern. Arms drive, eyes up.",
    equipment: "Agility ladder or chalk",
    minutes: 10,
    difficulty: "Foundation",
  },
  {
    name: "T-Test Turns",
    skill: "agility",
    category: "PHYSICAL",
    summary: "Change direction at speed around a T of cones.",
    instructions:
      "Sprint 10m forward, shuffle 5m left, 10m right, 5m left, then backpedal to the start. Time 4 runs and record your best.",
    equipment: "4 cones, stopwatch",
    minutes: 12,
    difficulty: "Developing",
  },
  {
    name: "Ball Mastery Intervals",
    skill: "stamina",
    category: "PHYSICAL",
    summary: "Fitness work with the ball at your feet.",
    instructions:
      "40 seconds of continuous toe-taps, sole rolls and inside-outside touches, 20 seconds rest. Repeat for 8 rounds. Try to keep the same pace in the last round as the first.",
    equipment: "Ball",
    minutes: 10,
    difficulty: "Foundation",
  },
  {
    name: "Box-to-Box Runs",
    skill: "stamina",
    category: "PHYSICAL",
    summary: "Repeat runs that copy match demands.",
    instructions:
      "Run 40m at 80% pace, walk back. Repeat 8 times. Add one rep each week. Stop if you feel any pain.",
    equipment: "Cones",
    minutes: 15,
    difficulty: "Developing",
  },
  {
    name: "Bodyweight Strength Circuit",
    skill: "strength",
    category: "PHYSICAL",
    summary: "Age-appropriate strength without weights.",
    instructions:
      "Squats x10, lunges x6 each leg, plank 20s, glute bridge x10, side plank 15s each side. 3 rounds. Good form matters more than speed.",
    equipment: "None",
    minutes: 12,
    difficulty: "Foundation",
  },
  {
    name: "Single-Leg Balance Passes",
    skill: "coordination",
    category: "PHYSICAL",
    summary: "Balance on one leg while passing against a wall.",
    instructions:
      "Stand on one leg and pass 20 balls off a wall with the other foot without putting it down. Switch legs. Progress by closing your eyes between passes.",
    equipment: "Ball, wall",
    minutes: 10,
    difficulty: "Foundation",
  },
  {
    name: "Pressure Penalties",
    skill: "composure",
    category: "MENTAL",
    summary: "Practise a routine that keeps you calm.",
    instructions:
      "Create a 3-step routine before each penalty: breath, pick your spot, commit. Take 10 penalties with a parent adding pressure (countdown, noise). Score how calm you felt 1-5.",
    equipment: "Ball, goal",
    minutes: 10,
    difficulty: "Developing",
  },
  {
    name: "Mistake Reset",
    skill: "resilience",
    category: "MENTAL",
    summary: "A quick physical cue to move on from errors.",
    instructions:
      "Pick a reset cue (clap, touch your shin pad, say 'next'). In every home session, use it after each mistake. After matches, write one thing that went well and one thing to try next time.",
    equipment: "Notebook",
    minutes: 5,
    difficulty: "Foundation",
  },
  {
    name: "Talk It Through",
    skill: "communication",
    category: "MENTAL",
    summary: "Practise clear, short on-pitch calls.",
    instructions:
      "Learn five calls: 'Man on', 'Time', 'Turn', 'Switch', 'Away'. Use one in every training rep this week. Ask your coach to count your calls in one session.",
    equipment: "None",
    minutes: 5,
    difficulty: "Foundation",
    atHome: false,
  },
  {
    name: "Effort Tracker",
    skill: "workRate",
    category: "MENTAL",
    summary: "Score your effort honestly after each session.",
    instructions:
      "After every training and match, rate your effort 1-5 and note one moment you worked hard without the ball. Share it with your coach at the end of the week.",
    equipment: "Notebook or app check-in",
    minutes: 5,
    difficulty: "Foundation",
  },
  {
    name: "Ask One Question",
    skill: "coachability",
    category: "MENTAL",
    summary: "Turn feedback into action.",
    instructions:
      "After each session, ask your coach one question about your game. Write the answer down and try it at your next session.",
    equipment: "Notebook",
    minutes: 5,
    difficulty: "Foundation",
    atHome: false,
  },
];
