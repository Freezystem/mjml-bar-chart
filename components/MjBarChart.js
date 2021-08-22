import { BodyComponent } from 'mjml-core'

export default class MjBarChart extends BodyComponent {
  static endingTag = true
  
  static dependencies = {
    "mj-column": ["mj-bar-chart"],
    "mj-bar-chart": []
  }

  static allowedAttributes = {
    "title": "string",
    "dataset-labels": "string",
    "datasets": "string",
    "groups": "string",
    "colors": "string",
    "axis-color": "color",
    "height": "unit(px)",
    "bar-width": "unit(px)",
    "separator-width": "unit(px)"
  }

  static defaultAttributes = {
    "axis-color":"#d4d4d4",
    "height": "200",
    "bar-width": "30",
    "separator-width": "30"
  }

  #getChartTitle() {
    if (!this.title) {
      return null;
    } 
    
    return `
      <table ${this.htmlAttributes({style: "chartTitleWrapper"})}>
        <tr>
          <td ${this.htmlAttributes({style: "chartTitle"})}>${this.title}</td>
        </tr>
      </table>
    `;
  }

  #getChartBar(value, color) {
    value = value > 0 ? value : 0;
    const plainPartHeight = Math.round(value / this.higherValue * this.chartHeight);
    const emptyPartHeight = this.chartHeight - plainPartHeight;
    
    const emptyCellStyle = {
      "padding": "0",
      "height": `${emptyPartHeight}px`
    }

    const plainCellStyle = {
      "padding": "0",
      "height": `${plainPartHeight}px`,
      "background-color": color
    }
    
    return `
      <td style="padding:0">
        <table ${this.htmlAttributes({ style: "chartBarWrapper" })}>
          <tr>
            <td ${this.htmlAttributes({ style: emptyCellStyle })}></td>
          </tr>
          <tr>
            <td ${this.htmlAttributes({ style: plainCellStyle })}></td>
          </tr>
        </table>
      </td>
    `;
  }
  
  #getChartBarSeparator = () => `<td ${this.htmlAttributes({ style: "chartBarSeparator" })}></td>`;
  
  #getChart() {
  	const bars = [this.#getChartBarSeparator()];
    
  	for (const dataset of this.datasets) {
    	for (let i = 0; i < dataset.data.length; i++) {
      	bars.push(this.#getChartBar(dataset.data[i], this.colors[i]));
      }
      
      bars.push(this.#getChartBarSeparator());
    }
    
    return `
      <table ${this.htmlAttributes({ style: "barChart" })}>
        <tr>
          <td style="padding:0;height:10px;"></td>
        </tr>
        <tr>
          ${bars.join("\n")}
        </tr>
      </table>
    `;
  }
  
  #getLabel = value => `<td ${this.htmlAttributes({ style: "chartLabel" })}>${value}</td>`
  
  #getChartLabels() {
    const labels = [this.#getChartBarSeparator()];
    
  	for (const dataset of this.datasets) {
      labels.push(this.#getLabel(dataset.label));
      labels.push(this.#getChartBarSeparator());
    }
    
    return `
      <table ${this.htmlAttributes({ style: "chartLabelWrapper" })}>
        <tr>
          ${labels.join("\n")}
        </tr>
      </table>
    `;
  }
  
  #getLegend(value, color) {
    const legendStyle = {
      "padding": "0 10px",
      "height": "20px",
      "font-size": "14px",
      "border-left": `${this.barWidth}px solid ${color}`
    }
    
    return `
      <span ${this.htmlAttributes({ style: legendStyle })}>${value}</span>
    `;
  }
  
  #getChartLegend() {
    return `
      <table ${this.htmlAttributes({ style: "chartLegendWrapper" })}>
        <tr>
          <td style="padding:0;height:10px;"></td>
        </tr>
        <tr>
          <td style="padding:0;">
            <p ${this.htmlAttributes({ style: "chartLegend" })}>
              ${this.groups.map((g, i) => this.#getLegend(g, this.colors[i]))}
            </p>
          </td>
        </tr>
      </table>
    `;
  }
  
  #getScale() {
    return `
      <table style="border-collapse:collapse;">
        <tr>
          <td ${this.htmlAttributes({ style: "scaleTop" })}>${this.higherValue}</td>
        </tr>
        <tr>
          <td ${this.htmlAttributes({ style: "scaleMiddle" })}>${Math.trunc(this.higherValue/2)}</td>
        </tr>
        <tr>
          <td ${this.htmlAttributes({ style: "scaleBottom" })}>0</td>
        </tr>
      </table>
    `;
  }

  getStyles() {
    return {
      chartTitleWrapper: {
        "width": "100%",
        "border-collapse": "collapse"
      },
      chartTitle: {
        "padding": "0",
        "height": "40px",
        "font-weight": "bold",
        "text-align": "center",
        "font-size": "20px"
      },
      chartBarSeparator: {
        "padding": "0",
        "min-width": `${this.separatorWidth}px`,
        "max-width": `${this.separatorWidth}px`
      },
      chartBarWrapper: {
        "padding": "0",
        "min-width": `${this.barWidth}px`,
        "max-width": `${this.barWidth}px`
      },
      barChart: {
        "border-collapse": "collapse",
        "border-left": `2px solid ${this.axisColor}`,
        "border-bottom": `2px solid ${this.axisColor}`
      },
      chartLabelWrapper: {
        "border-collapse": "collapse",
        "border-left": "2px solid transparent"
      },
      chartLabel: {
        "height": "30px",
        "padding": "0",
        "font-size": "14px",
        "text-align": "center",
        "overflow": "hidden",
        "min-width": `${this.barWidth * this.groups.length}px`,
        "max-width": `${this.barWidth * this.groups.length}px`
      },
      chartLegendWrapper: {
        "border-collapse": "collapse",
        "width": "100%"
      },
      chartLegend: {
        "margin": "0",
        "padding": "0",
        "max-width": `${this.chartWidth}px`,
        "line-height": "20px",
        "text-align": "center"
      },
      scaleTop: {
        "padding": "0 5px 0 0",
        "height": "50px",
        "vertical-align": "bottom",
        "text-align": "right",
        "font-size": "14px",
        "color": this.axisColor
      },
      scaleMiddle: {
        "padding": "0 5px 0 0",
        "height": `${(this.chartHeight + 2)/2}px`,
        "vertical-align": "bottom",
        "text-align": "right",
        "font-size": "14px",
        "color": this.axisColor
      },
      scaleBottom: {
        "padding": "0 5px 0 0",
        "height": `${(this.chartHeight + 2)/2}px`,
        "vertical-align": "bottom",
        "text-align": "right",
        "font-size": "14px",
        "color": this.axisColor
      }
    }
  }

  render() {
    this.title = this.getAttribute("title");
    this.datasetValues = this.getAttribute("datasets").split(",").map(v => v.split(" "));
    this.datasets = this.getAttribute("dataset-labels")
    .split(",")
    .map((label, idx) => ({
      label,
      data: this.datasetValues[idx].map(n => parseInt(n, 10))
    }));
    this.higherValue = this.datasetValues.reduce((vs, d) => [...vs, ...d], []).sort((a, b) => b - a)[0];
    this.colors = this.getAttribute("colors").split(",");
    this.axisColor = this.getAttribute("axis-color");
  	this.groups = this.getAttribute("groups").split(",");
    this.chartHeight = parseInt(this.getAttribute("height"), 10);
    this.barWidth = parseInt(this.getAttribute("bar-width"), 10);
    this.separatorWidth = parseInt(this.getAttribute("separator-width"), 10);
    this.chartWidth = 2 + (this.separatorWidth * (this.groups.length + 1)) +
      (this.barWidth * this.datasets.length * this.groups.length);

    return `
      <table id="mjmlBarChart" style="border-collapse:collapse;margin:0 auto;">
        <tr>
          <td style="padding:0;vertical-align:top;">
            ${this.#getScale()}
          </td>
          <td style="padding:0;">
            <table style="border-collapse:collapse;">
              <tr>
                <td style="padding:0;">
                  ${this.#getChartTitle()}
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  ${this.#getChart()}
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  ${this.#getChartLabels()}
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  ${this.#getChartLegend()}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }
}
