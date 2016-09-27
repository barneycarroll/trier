# trier

A tool for recursively iterating through DOM trees

[What](#what) | [How](#how) | [Why](#why) | [Erm](#erm)

## What?

Trier is a tool I wrote to iteratively parse and mutate large SVG structures: specifically, text-wrapping - I needed the structure of my code to map to the structure of the DOM & an idiom where I could rely on scope and sequence of read & write operations.

Trier consumes a hash whose keys are query selectors, and whose values are either functions which will execute once for each matched node, further hashes, or arrays containing a mix of the two to be invoked in sequence.

For convenience, function endpoints can return further endpoints, allowing ad-hoc scopes when you need to share data between endpoints.

## How?

```javascript
trier({
  'svg.container' : container => {                         // For each `svg.container`
    const [{width: maxWidth}] = container.getClientRects() // Get the width

    let totalLines = 0                                     // Start a line counter

    return [{
      'text' : text => {                                   // For each of its `text` nodes
        let localLines = 1                                 // There is at least one line
        let x = 0                                          // Start at x = 0

        text.innerHTML = text.innerHTML                    // Split text into words
          .split( /\s+/ )
          .map( x =>
            `<tspan>${x} </tspan>`
          )

        return [{
          'tspan' : tspan => {                             // For each of these
            if(x > maxWidth){                              // If x overflows the container,
              localLines++                                 // Start a new lines

              x = 0                                        // At x = 0
            }

            tspan.setAttribute('x',  x)                    // Position the word
            tspan.setAttribute('dy', localLines * 16)

            x += tspan.getClientRects()[0].width           // Add the word length to x
          }
        },
          () =>                                            // After measuring all words,
            totalLines += localLines                       // add the line count to total
        ]
      }
    },
      () =>                                                // After parsing each text node,
        container.setAttribute('y',                        // Increase container height accordingly
          container.getAttribute('y')
          + (totalLines * 16)
        )
    ]
  }
})
```

## Why?

Trier exists somewhere in the space between XSLT, declarative virtual DOM idioms, and CSS.

Because pure SVG - ie standalone SVG1.1 that isn't reliant on advanced browser CSS features - often requires a great many complex concerns to be expressed in the SVG structure itself, it makes sense to separate concerns into a first pass that produces the necessary structure from data available ahead of time (using whatever templating or DOM manipulation tools at hand), and a second pass (using Trier) to cater for concerns which require reading from the rendered first pass (layout inter-dependencies - especially text layout).

In other words, Trier is useful when the DOM needs to be reflexive - ie some properties are dependent upon the rendering of others - and the combined volume of logic & structure necessary to produce the requisite DOM is too unwieldy for a single pass.

Trier, compared to other tools like D3 or virtual DOM libs like React:
* doesn't come with any DOM manipulation tools (bring your own)
* requires a pre-existing structure to operate on
* has no opinions about statefulness
* uses a structure that matches the DOM & allows [1]
* flexible sequence of operations [2]
* flexible concentric scopes [3]

### [1] DOM matching structure

```javascript
trier( {
  'svg' : {
    'rect:first-child'           : rect        => actOn1st( rect ),
    'rect:not( 'first-child' )'  : ( rect, i ) => actOnRest( rect, i )
  }
} )
```

### [2] Flexible sequence of operations

```javascript
trier( {
  'svg' : [
    svg => doThisBefore( svg ),

    {
      'rect:first-child'           : rect        => actOn1st( rect ),
      'rect:not( 'first-child' )'  : ( rect, i ) => actOnRest( rect, i )
    },

    svg => doThisAfter( svg )
  ]
} )
```

### [3] Flexible concentric scopes

```javascript
trier( {
  'svg' : svg => {
    const reference = doThisBefore( svg )

    return [
      {
        'rect:first-child'           : rect        => actOn1st( rect, reference ),
        'rect:not( 'first-child' )'  : ( rect, i ) => actOnRest( rect, reference )
      },

      svg => doThisAfter( svg )
    ]
  ]
} )
```

## Erm

### This doesn't, like, actually *do* anything?

That's right: it's just a structural convenience.

### Flash-in-the-pan, declarative-all-the-things, functional-programming, code-style-over-substance npm-detritus, eh?

Lap it up. But sometimes idiomatic conventions are useful in and of themselves for focussing the mind. You wouldn't've liked the imperative spaghetti I had before this.

### Anything else?

Trier is named after Lars von Trier. I approached SVG DOM manipulation as a garden whithin which to restore my broken brain. But nature is Satan's church, and chaos reigns. Like Lars' Antichrist, this artefact helped give me a framework within which to hang horrific catharsis.

Alternatively, a 'trier' is someone who tries really hard, despite their lack of success. I really tried to make SVG DOM work rationally. I really did. I'm a trier.

'Trier' is also Germanic phoneticisation of the first and last syllables of 'tree iterator'. Somehow I've never been able to ditch a tendency to think of different approaches to structural iteration when coming into big math-heavy DOM operations.

It's also a town in Germany which foreigners sometimes call Treve.
