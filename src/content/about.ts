/**
 * The About page. The bio itself lives in `src/portfolio.config.ts`.
 */
export const about = {
  /** The large first line of the page. */
  lead: 'Sam Ibarra is a product designer in Portland who designs the thing and stays until it works.',

  services: [
    {
      title: 'Product design',
      body: 'From a vague brief to shipped screens: flows, interface, the copy on the buttons, and the edge cases nobody listed.'
    },
    {
      title: 'Prototypes you can hold',
      body: 'Working prototypes in code or on a device, built to answer one question in a week instead of debating it for a month.'
    },
    {
      title: 'Design for hardware',
      body: 'Small screens, LEDs, dials, and the companion app that has to agree with them.'
    },
    {
      title: 'Design systems, sized right',
      body: 'Tokens and components for teams of three to thirty, and the audit that tells you which ones you actually use.'
    }
  ],

  experience: [
    { years: '2022 – now', role: 'Independent product designer', place: 'Portland, OR', note: 'Clients below' },
    { years: '2019 – 2022', role: 'Senior product designer', place: 'Fieldnote, Portland', note: 'Field-service software for 4,000 HVAC crews' },
    { years: '2016 – 2019', role: 'Product designer', place: 'Pinecone Studio, Seattle', note: 'Agency work for transit, health, and retail' },
    { years: '2014 – 2016', role: 'Designer and front-end developer', place: 'Rose City Radio, Portland', note: 'Apps for a public radio station' },
    { years: '2010 – 2014', role: 'Audio technician', place: 'Division Street Hi-Fi', note: 'Repaired amplifiers, receivers, and turntables' }
  ],

  clients: [
    'Stoop',
    'Long Wave Audio',
    'Ebb Labs',
    'Alder Credit Union',
    'Margin',
    'Nook Home',
    'Halyard',
    'Cascadia Rail',
    'Fieldnote',
    'Moorage',
    'Pinecone Studio',
    'Rose City Radio'
  ],

  /** Small facts for the side column. */
  facts: [
    ['Based in', 'Portland, Oregon'],
    ['Working with', 'Teams in US Pacific and Mountain time'],
    ['Availability', 'Booking projects from February 2027'],
    ['Tools', 'Sketchbooks, Swift, React, and whatever the team already uses']
  ] as [string, string][]
};
