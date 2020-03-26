export type Preset = {
  readonly name: string;
  readonly template: string;
};

export const presets: Preset[] = [
  {
    name: 'Default',
    template: `
___
[**Player FAQ**](http://www.reddit.com/r/ultrahardcore/wiki/playerfaq) || 
[**Time.is**](http://time.is/UTC) || 
[**UBL Guidelines**](https://www.reddit.com/r/uhccourtroom/wiki/banguidelines) 

___
###[Server Information](#I)
___
 
 | [](#I)
---|---
**Location**     | {{ location }}
|
**IP Address**  | {{ address }} {{ ip }}
|
**RAM**      | 4GB
**Slots**     |  {{ slots }}
**Version**  | {{ version }}
 
&nbsp;
___
###[Match Information](#I)
___
 
 
 | [](#I)
---|---
**Opening Time** | {{opens|moment>MMM Do HH:mm}}
**Starting Time** | 5 (FFA) or 10 (Teams) Minutes after the opening time
|
**PvP/iPvP** | {{pvpEnabledAt}} Minutes after start.
**Meetup** | {{length}} Minutes after start.
**Permaday** | Enabled at meetup.
**Map size** | {{mapSize}}x{{mapSize}}
 
&nbsp;
___
###[Game Information](#I)
___
 
 | [](#I)
---|---
**Absorption** | Enabled
**Golden Heads** | Enabled, 3 hearts
**God Apples** | Disabled
**Starter Food**|None
**Horses**|Disabled
**Nether** | Disabled
**Bookshelves** | Disabled
**Pearl Damage** | Disabled
 
&nbsp;
___
###[Scenario Information](#I)
___
 | [](#I)
---|---
**Scenario 1**|Scenario 1 description here
**Scenario 2**|Scenario 2 description here
&nbsp;
___
    `,
  },
];
