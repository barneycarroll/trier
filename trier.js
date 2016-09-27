export default function trier( directive, root = document ){
  if( Array.isArray( directive ) )
    return directive.forEach( directive => trier( directive, root ) )

  Object.keys( directive ).forEach( key => {
    const elements   = root.querySelectorAll( key )

    if( elements.length === 0 ) return

    let   directives = directive[ key ]

    if( !Array.isArray( directives ) )
      directives = [ directives ]

    Array.from( elements ).forEach( ( element, index ) => {
      directives.forEach( function process( directive ){
        if( typeof directive == 'function' ){
          const output = directive( element, index )

          if( output )
            process( output )
        }

        else
          trier( directive, element )
      } )
    } )
  } )
}
