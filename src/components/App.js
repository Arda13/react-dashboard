import React, { Component } from "react";
import { Container, Nav } from "./styled-components";

// fusioncharts
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import Maps from "fusioncharts/fusioncharts.maps";
import EuRegion from "fusionmaps/maps/es/fusioncharts.centraleuropeanregion";
import ReactFC from "react-fusioncharts";
import "./charts-theme";

import config from "./config";
import Dropdown from "react-dropdown";
import formatNum from "./format-number";


ReactFC.fcRoot(FusionCharts, Charts, Maps,EuRegion);

const url = `https://sheets.googleapis.com/v4/spreadsheets/${
  config.spreadsheetId
}/values:batchGet?ranges=Sayfa1&majorDimension=ROWS&key=${config.apiKey}`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      dropdownOptions: [],
      selectedValue: null,
      polRevenue: null,
      gerRevenue: null,
      czRevenue: null,
      totalRevenue: null,
      productViews: null,
      purchaseRate: " ",
      checkoutRate: " ",
      abandonedRate: " ",
      ordersTrendStore: []
    };
  }

  getData = arg => {
    // google sheets data
    const arr = this.state.items;
    const arrLen = arr.length;

    // kpi's
    // amazon revenue
    let polRevenue = 0;
    //ebay revenue
    let gerRevenue = 0;
    // etsy revenue
    let czRevenue = 0;
    // total revenue
    let totalRevenue = 0;
    // product views
    let productViews = 0;
    // purchase rate
    let purchaseRate = 0;
    // checkout rate
    let checkoutRate = 0;
    // abandoned rate
    let abandonedRate = 0;
    // order trend by brand
    let ordersTrendStore = [];
    // order trend by region
    let ordersTrendRegion = [];
    let orderesTrendnw = 0;
    let orderesTrendsw = 0;
    let orderesTrendc = 0;
    let orderesTrendne = 0;
    let orderesTrendse = 0;

    let selectedValue = null;

    for (let i = 0; i < arrLen; i++) {
      if (arg === arr[i]["month"]) {
        if (arr[i]["source"] === "PL") {
          polRevenue += parseInt(arr[i].revenue);
          ordersTrendStore.push({
            label: "Poland",
            value: arr[i].orders,
            displayValue: `${arr[i].orders} orders`
          });
        } else if (arr[i]["source"] === "GER") {
          gerRevenue += parseInt(arr[i].revenue);
          ordersTrendStore.push({
            label: "Germany",
            value: arr[i].orders,
            displayValue: `${arr[i].orders} orders`
          });
        } else if (arr[i]["source"] === "CZ") {
          czRevenue += parseInt(arr[i].revenue);
          ordersTrendStore.push({
            label: "Czech",
            value: arr[i].orders,
            displayValue: `${arr[i].orders} orders`
          });
        }
        productViews += parseInt(arr[i].production);
        purchaseRate += parseInt(arr[i].purchase_rate / 3);
        checkoutRate += parseInt(arr[i].refund_rate / 3);
        abandonedRate += parseInt(arr[i].open_complaints / 8);
        orderesTrendnw += parseInt(arr[i].orders_pl);
        orderesTrendsw += parseInt(arr[i].orders_ger);
        orderesTrendc += parseInt(arr[i].orders_cz);
        orderesTrendne += parseInt(arr[i].orders_eng);
        orderesTrendse += parseInt(arr[i].orders_fr);
      }
    }

    totalRevenue = polRevenue + gerRevenue + czRevenue;
    ordersTrendRegion.push({
      id: "017",
      value: orderesTrendne
    }, {
      id: "010",
      value: orderesTrendnw
    }, {
      id: "042",
      value: orderesTrendse
    }, {
      id: "013",
      value: orderesTrendsw
    }, {
      id: "009",
      value: orderesTrendc
    });

    selectedValue = arg;

    // setting state
    this.setState({
      polRevenue: formatNum(polRevenue),
      gerRevenue: formatNum(gerRevenue),
      czRevenue: formatNum(czRevenue),
      totalRevenue: formatNum(totalRevenue),
      productViews: formatNum(productViews),
      purchaseRate: purchaseRate,
      checkoutRate: checkoutRate,
     abandonedRate: abandonedRate,
      ordersTrendStore: ordersTrendStore,
      ordersTrendRegion: ordersTrendRegion,
      selectedValue: selectedValue
    });
  };

  updateDashboard = event => {
    this.getData(event.value);
    this.setState({ selectedValue: event.value });
  };

  componentDidMount() {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        let batchRowValues = data.valueRanges[0].values;

        const rows = [];
        for (let i = 1; i < batchRowValues.length; i++) {
          let rowObject = {};
          for (let j = 0; j < batchRowValues[i].length; j++) {
            rowObject[batchRowValues[0][j]] = batchRowValues[i][j];
          }
          rows.push(rowObject);
        }

        // dropdown options
        let dropdownOptions = [];

        for (let i = 0; i < rows.length; i++) {
          dropdownOptions.push(rows[i].month);
        }

        dropdownOptions = Array.from(new Set(dropdownOptions)).reverse();

        this.setState(
          {
            items: rows,
            dropdownOptions: dropdownOptions,
            selectedValue: "Nov 2020"
          },
          () => this.getData("Nov 2020")
        );
      });
  }

  render() {
    return (
      <Container>
        <Nav className="navbar navbar-expand-lg fixed-top is-light is-light-text">
          <Container className="text-large text-warning">Shiny Dashboard Dark Theme</Container>
          <Container className="navbar-nav ml-auto">
            <Dropdown
              className="pr-2 custom-dropdown"
              options={this.state.dropdownOptions}
              onChange={this.updateDashboard}
              value={this.state.selectedValue}
              placeholder="Select an option"
            />
          </Container>
        </Nav>
        <Container className="container-fluid pr-5 pl-5 pt-5 pb-5">
          <Container className="row">
            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark border border-success ">
                <Container className="card-heading">
                  <Container style={{color:"#ffc107"}} className="is-dark-text-light letter-spacing text-small ">
                    Total Revenue
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fas fa-globe-europe text-x-large logo-adjust" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  {this.state.totalRevenue}
                </Container>
              </Container>
            </Container>

            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark border border-primary">
                <Container className="card-heading">
                  <Container style={{color:"#ffc107"}} className="is-dark-text-light letter-spacing text-small">
                    Revenue from Poland
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fas fa-euro-sign text-x-large logo-adjust" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  {this.state.polRevenue}
                </Container>
              </Container>
            </Container>

            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark border border-warning">
                <Container className="card-heading">
                  <Container  style={{color:"#ffc107"}} className="is-dark-text-light letter-spacing text-small">
                    Revenue from Germany
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fas fa-euro-sign text-x-large logo-adjust" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  {this.state.gerRevenue}
                </Container>
              </Container>
            </Container>

            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark border border-danger">
                <Container className="card-heading">
                  <Container  style={{color:"#ffc107"}} className="is-dark-text-light letter-spacing text-small">
                    Revenue from Czech
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fas fa-euro-sign text-x-large logo-adjust" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  {this.state.czRevenue}
                </Container>
              </Container>
            </Container>
          </Container>

          {/* row 2 - conversion */}
          <Container className="row ">
            <Container className="col-md-4 col-lg-3 is-light-text mb-4">
              <Container className="card grid-card is-card-dark">
                <Container className="card-heading mb-3">
                  <Container style={{color:"#ffc107"}}className="is-dark-text-light letter-spacing text-small">
                    Monthly Production
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fas fa-industry text-x-large logo-adjust" />
                  </Container>
                </Container>
                <Container className="card-value pt-4 text-x-large">
                  {this.state.productViews}
                  <span className="text-medium pl-2 is-dark-text-light">
                    pieces
                  </span>
                </Container>
                
              </Container>
            </Container>

            <Container className="col-md-8 col-lg-9 is-light-text mb-4">
              <Container className="card bg-warning chart-card">
                <Container className="row full-height">
                  <Container className="col-sm-4 full height">
                    <Container className="chart-container full-height">
                      <ReactFC
                        {...{
                          type: "doughnut2d",
                          width: "100%",
                          height: "100%",
                          dataFormat: "json",
                          containerBackgroundOpacity: "0",
                          dataSource: {
                            chart: {
                              caption: "Purchase Rate",
                              theme: "ecommerce",
                              defaultCenterLabel: `${this.state.purchaseRate}%`,
                              paletteColors: "#5cb85c,#343a40"
                            },
                            data: [
                              {
                                label: "active",
                                value: `${this.state.purchaseRate}`
                              },
                              {
                                label: "inactive",
                                alpha: "100",
                                value: `${100 - this.state.purchaseRate}`
                              }
                            ]
                          }
                        }}
                      />
                    </Container>
                  </Container>
                  <Container className="col-sm-4 full-height border-left border-right">
                    <Container className="chart-container full-height">
                      <ReactFC
                        {...{
                          type: "doughnut2d",
                          width: "100%",
                          height: "100%",
                          dataFormat: "json",
                          containerBackgroundOpacity: "0",
                          dataSource: {
                            chart: {
                              caption: "Refund Rate",
                              theme: "ecommerce",
                              defaultCenterLabel: `${this.state.checkoutRate}%`,
                              paletteColors: "#41B6C4, #343a40"
                            },
                            data: [
                              {
                                label: "active",
                                value: `${this.state.checkoutRate}`
                              },
                              {
                                label: "inactive",
                                alpha: 100,
                                value: `${100 - this.state.checkoutRate}`
                              }
                            ]
                          }
                        }}
                      />
                    </Container>
                  </Container>
                  <Container className="col-sm-4 full-height">
                    <Container className="chart-container full-height">
                      <ReactFC
                        {...{
                          type: "doughnut2d",
                          width: "100%",
                          height: "100%",
                          dataFormat: "json",
                          containerBackgroundOpacity: "0",
                          dataSource: {
                            chart: {
                              caption: "Complaints Rate",
                              theme: "ecommerce",
                              defaultCenterLabel: `${
                                this.state.abandonedRate
                              }%`,
                              paletteColors: "#d9534f, #343a40"
                            },
                            data: [
                              {
                                label: "active",
                                value: `${this.state.abandonedRate}`
                              },
                              {
                                label: "inactive",
                                alpha: 100,
                                value: `${100 - this.state.abandonedRate}`
                              }
                            ]
                          }
                        }}
                      />
                    </Container>
                  </Container>
                </Container>
              </Container>
            </Container>
          </Container>

          {/* row 3 - orders trend */}
          <Container className="row" style={{ minHeight: "400px" }}>
            <Container className="col-md-6 mb-4">
              <Container className="card is-card-dark chart-card">
                <Container className="chart-container large full-height">
                  <ReactFC
                    {...{
                      type: "bar2d",
                      width: "100%",
                      height: "100%",
                      dataFormat: "json",
                      containerBackgroundOpacity: "0",
                      dataEmptyMessage: "Loading Data...",
                      dataSource: {
                        chart: {
                          theme: "ecommerce",
                          caption: "Orders Trend",
                          subCaption: "By Countries"
                        },
                        data: [
                          {
                            "label": "Poland",
                            "value": "800",
                            "id": "06"
                        },
                        {
                            "label": "Germany",
                            "value": "730",
                            "id":"03",

                        },
                        {
                            "label": "Czech",
                            "value": "590",
                            "id":"02"

                        },
                        ]
                      }
                    }}
                  />
                </Container>
              </Container>
            </Container>

            <Container className="col-md-6 mb-4">
              <Container className="card is-card-dark chart-card">
                <Container className="chart-container large full-height">
                  <ReactFC style={{fill:"#292b2c!"}}
                    {...{
                      type: "centraleuropeanregion",
                      width: "100%",
                      height: "100%",
                      dataFormat: "json",
                      bgAlpha:"0",
                      canvasBgAlpha:"0",
                      dataEmptyMessage: "Loading Data...",
                      dataSource: {
                        chart: {
                          theme: "ecommerce",
                          caption: "Orders Trend",
                          subCaption: "By Countries"
                        },
                        colorrange: {
                          code: "#F64F4B",
                          minvalue: "0",
                          gradient: "1",
                          color: [
                            {
                              minValue: "10",
                              maxvalue: "25",
                              code: "#EDF8B1"
                            },
                            {
                              minvalue: "25",
                              maxvalue: "50",
                              code: "#18D380"
                            }
                          ]
                        },
                        data: [
                          {
                            id: "02",
                            value: "35",
                          },
                          {
                            id: "03",
                            value: "40",
                          },
                          {
                            id: "06",
                            value: "45",
                          },
                        ]
                      }
                    }}
                  />
                </Container>
              </Container>
            </Container>
          </Container>
        </Container>
        {/* content area end */}
      </Container>
    );
  }
}

export default App;
