# trier

A tool for recursively iterating through DOM trees

***

Trier is a tool I wrote to iteratively parse and mutate large SVG structures: specifically, text-wrapping - I needed the structure of my code to map to the structure of the DOM & an idiom where I could rely on scope and sequence of read & write operations.

Trier consumes a hash whose keys are query selectors, and whose values are either functions which will execute once for each matched node, further hashes, or arrays containing a mix of the two to be invoked in sequence.

For convenience, function endpoints can return further endpoints, allowing ad-hoc scopes when you need to share data between endpoints.

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
