# `todo.md` To be fixed status

This is a one-to-one tracking copy of every entry currently under the
`# To be fixed` heading in [`todo.md`](./todo.md). Entries from the other
sections are intentionally excluded.

1. ✅ **Yes** — Remove the "Select an item to view details" thing.
2. ✅ **Yes** — When in an item within a section, the Up button should send you back to the section, not the sections menu.
3. ✅ **Yes** — Make sure the buttons in home and sections are all square and same size (as in all of the same page are the same size). As of now, for example, Developer Comments box is bigger.
4. ✅ **Yes** — On mobile, the comments of the section should be shown below the list of the items.
5. ✅ **Yes** — Others page should have its own comment section.
6. ✅ **Yes** — Make it so that when the page is updated in GitHub pages, cache is bust.
7. ✅ **Yes** — Bug: some items like #/bs1/weapons/111 have the original version in English, so that means they never should've been translated in the first place.
8. ✅ **Yes** — This text "New comments appear in this general activity feed in about 2 to 3 minutes after being posted. If new comments do not appear, please press Ctrl + F5 (or Cmd + Shift + R on Mac) to clear your browser cache." in #/activity has this weird 3D aspect. Fix that
9. ✅ **Yes** — Fix the titles of some pages being stuff like "Enemie 1" or "CommonEvent 1" or "Classe 1".
10. ✅ **Yes** — The title of BS2 pages are correct. But for RRW and BS1, you show rrw and bs1. Fix that.
11. ✅ **Yes** — If directly in an item page, the scroll should be where that item is. Similar to the logic of when you search for an item and empty the search bar.
12. ✅ **Yes** — All linked texts should have a line under it.
13. ✅ **Yes** — When clicking with the middle button of the mouse on a button or a link, the new tab should send you to the page that right clicking would've.
14. ✅ **Yes** — The sprites for Enemies in BS1 are wrong. Please check why and if other graphics are also wrong. BS1 and RRW use game-specific battler paths, and RRW uses each record's actual `battlerName`; missing images are treated as intentional for enemy records that are not present in the game and fall back to icons.
15. ✅ **Yes** — Remove the redundancy. For example, in actions, it shows the skills of the enemies, but it shows again in references. Just the first one would be enough. This is just one example, there might be others.
16. ✅ **Yes** — Why is every couple of hours the page updated? Is that necessary or can it be disabled and keep functionality? The unnecessary six-hour schedule was removed; discussion events and manual dispatch remain.
17. ✅ **Yes** — Were references implemented in all sections? Thoroughly check please. Reverse-reference scanning now covers the core and supplementary sections, structured relationships use the correct IDs, and duplicate suppression is limited to true overlaps.
18. ✅ **Yes** — I want you to ponder if there's something that was forgotten to implement in one of the sections or that you think should be implemented. The audit added missing actor character-graphic metadata and corrected location metadata/parent-location rendering.
19. ✅ **Yes** — YOU are supposed to translate everything. Do it already. No Google Translate allowed. You do it yourself. Expanded the manually authored translation dictionaries and added a persistent final translation pass for mixed names, common events, troops, locations, comments, and generated display strings. Regenerated the runtime data and verified that no user-facing Japanese text remains; the only scan match is an intentional full-width emoticon in an otherwise English sentence.
