import * as React from 'react';
import { Collapse } from '@blueprintjs/core';
import { Markdown } from './Markdown';

const rules = `
#### Rule #1: Redos

Setting random teams again in random team matches or settings powers again in Superheroes
or Superheroes+ matches, unless it is due to a technical issue, is not permitted.

#### Rule #2: Rules

The rules stated on the match post must be the rules while the match is running.

#### Rule #3: Scenario(s)

The scenario(s) stated in the title of the match post must be the scenario(s)
while the match is running. If there is a technical issue with a scenario,
it can only be replaced with Vanilla or Vanilla+, not any other scenario.

Scenario(s) in the title must match with the scenarios in the post.

#### Rule #4: Donations

Donators may receive in-game benefits that are cosmetic, but may not receive any priority or advantage
over other players, including but not limited to:

- Can not be pre-whitelisted
- Can not be given reserved slots
- Can not be given the ability to spectate the match
- Can not be given an operator or staff rank, or similar permissions
- Can not be given special items
- Can not give a player any advantage for watching an advertisement

#### Rule #5: Screensharing

Hosts or staff members are not allowed to force players to share their screens during a game

#### Rule #6: UBL

All servers advertised must follow the 
[Universal Ban List](https://docs.google.com/spreadsheets/d/1VdyBZs4B-qoA8-IijPvbRUVBLfOuU9I5fV_PhuOWJao/pub)
The most simple way of doing this is adding the  AutoUBL plugin - the latest version is available
[here](http://dev.bukkit.org/bukkit-plugins/autoubl/files/)

#### Rule #7: Conflicting Scenarios and Team Sizes

There cannot be two matches next to each other's slots in the same region with all of the same (or similar)
scenarios and the same team size.

- Random and chosen teams are considered different team sizes.
- True Love is conisdered a Chosen teams of 2. (You may still label them as FFA True Love.)
- Double Dates is conisdered a Teams of X depending on the max team size 
(You may still label them as Teams of X Double Dates)
- Upgraded versions of a scenario count as the same scenario (ex: CutClean/KutKlean).
- Vanilla[+] is the lack of a scenario & therefore is exempt from this rule.
- Rush is not considered a scenario, so it is exempt from this rule.
- Ore multiplying gamemodes with smelted ores will not conflict with Cutclean games unless meats drop
smelted.

#### Rule #8: Game Count

The game count can only increase from a publically advertised and hosted matches and is a per-user count

Tournaments must use a separate counter than the usual match counter.

#### Rule #9: Host Names

Hosting under a name that is deemed offensive or could be interpreted as an insult is not allowed.

Hosting under a copy-cat or "fake" name is not allowed.

#### Rule #10: Banned Scenarios

Any scenario that acts like a PvP arena is not a match and cannot be advertised. For example, Last Man Standing (LMS).

Gamemodes where ores drop four times or more the usual amount are banned. TriplePackedOres, for example.

Ops vs The World is banned. If you wish to host it, you may modmail us gamemode specifics such as player slots, what 
items the OP team will have, and the size of the OP team.
`;

type HostingRulesState = {
  readonly isRulesOpen: boolean;
};

export class HostingRules extends React.Component<{}, HostingRulesState> {
  state = {
    isRulesOpen: false,
  };

  iconClasses = (): string => `pt-icon-chevron-${this.state.isRulesOpen ? 'up' : 'down'}`;

  toggleRules = (): void => this.setState(prev => ({ isRulesOpen: !prev.isRulesOpen }));

  stopPropagation = (e: React.MouseEvent<any>): void => e.stopPropagation();

  render() {
    return (
      <div
        className={`hosting-rules pt-intent-warning pt-callout ${this.iconClasses()}`}
        onClick={this.toggleRules}
      >
        <h3>Hosting Rules</h3>
        <Collapse isOpen={this.state.isRulesOpen}>
          <div onClick={this.stopPropagation}>
            <Markdown markdown={rules}/>
          </div>
        </Collapse>
      </div>
    );
  }
}
