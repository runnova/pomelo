# to do
- uploads
- text formatting 
- media/node options
- page theme
- user theme selector
- slideshow player

## screens
- the homescreen
- editor
  1. editing
    - *topbar*
      topbar deals with managing the current project
    - *editor sidebar*
      sidebar deals with changing things that are currently focused
      - *sidebar type sidebar*
        changes the current focus of the sidebar
      1. *insert*
        creating new nodes in current page
        - quick add node tiles
        - uploads
      2. node editor
        deals with a editing singular node which is in focus 
        - content
          the source, can either be text or media URL or path, it will directly be used by the nodes
        1. text
          - text kind dropdown
            - heading 1
            - heading 2
            - heading 3
            - subheading
            - paragraph
            - footnote
          - text formatting
            - bold
            - font size
            - margins
            - underline
            - heading rule
        2. media 
          - source URL / path
          - object fit
          - controls
          - autoplay (enabled)
          - caption
          - credit
          - alt text
      3. layout changer
        the layout of the current page
        - layout tiles
        - background color
    - preview / content editor
      clicking on nodes takes you to their editor in editor sidebar
    - headings sidebar
      tracks headings
    - timeline player buttons
    - reorderable cards timeline editor
      - individual card
        - card preview
  2. presenting
    - preview
    - timeline player buttons

## card
- card has top navigation to nearest previous biggest heading when there is no or smaller heading in page
- column width ratio can be set in sidebar>column editor

## node types
- text
- media

## project file
its JSON
{
  project meta and id
  cards: [
    {
      card meta and id
      "background": {
        "type": "media|color",
        "value": "SRC|HEX",
        "fit": "cover|contain|stretch",
        "autoplay": true
      }
      layout: {
        "ratio": [4, 3], (1, 1 default)
        // below is not required 
        "padding": 24,
        "gap": 16
      }
      text column: "left|right"
      nodes: [ // we know what types go in which column
        {
          node meta and id
          type: 
        }
      ]
    }
  ]
}


SETTINGS 
- media dont autoplay in editor
