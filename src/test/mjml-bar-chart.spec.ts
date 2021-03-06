import mjml2html from 'mjml'
import {registerComponent} from 'mjml-core'
import MjBarChart from '../index'

function toHtml(mjml: string): string {
  const {html, errors} = mjml2html(mjml)
  return errors.length > 0 ? errors[0].message : html
}

describe('mjml-bar-chart', () => {
  beforeAll(() => {
    registerComponent(MjBarChart)
  })
  
  it('should render the bar chart', () => {
    const mjml = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-bar-chart
                title="Sum of Requests by Department"
                dataset-labels="January,February,March" 
                datasets="33 14 27,18 66 42,7 15 21"
                groups="support,sales,tech"
                colors="#ffe5ec,#ffb3c6,#fb6f92"/>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    expect(toHtml(mjml)).toContain('<table id="mjmlBarChart"')
  })
})