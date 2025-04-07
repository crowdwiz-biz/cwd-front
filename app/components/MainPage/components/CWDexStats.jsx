import React from "react";
import Translate from "react-translate-component";
import {FormattedNumber} from "react-intl";
import tr from "assets/svg-images/svg-common/main-page/slider/tr.svg";
import chart from "assets/svg-images/svg-common/main-page/slider/bg.png";
class CWDexStats extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {dealsCount, dealsVolume, exRate} = this.props;

        return (
            <section className="cwdex_stats">
                <svg className="animation" viewBox="0 0 1920 250" preserveAspectRatio="none" width="100%" height="250" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dec27f75"/>
                            <stop offset="100%" stopColor="#DEC27F"/>
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dec27f75"/>
                            <stop offset="100%" stopColor="#E2E8F040"/>
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dec27f75"/>
                            <stop offset="100%" stopColor="#E2E8F040"/>
                        </linearGradient>
                        <filter id="blur1">
                            <feGaussianBlur stdDeviation="2" />
                        </filter>
                        <filter id="blur2">
                            <feGaussianBlur stdDeviation="1" />
                        </filter>
                    </defs>


                    <path d="M 0 150 Q 400 20, 800 150 T 1600 150 T 2400 150"
                        stroke="url(#gradient1)" strokeWidth="2" fill="transparent" strokeLinecap="round"
                        strokeDasharray="2400" strokeDashoffset="2400" filter="url(#blur1)">
                        <animate attributeName="stroke-dashoffset" from="2400" to="0" dur="3s" fill="freeze"/>
                    </path>

                    <path d="M 0 130 Q 500 230, 1000 130 T 2000 130 T 3000 130"
                        stroke="url(#gradient2)" strokeWidth="4" fill="transparent" strokeLinecap="round"
                        strokeDasharray="3000" strokeDashoffset="3000" filter="url(#blur2)">
                        <animate attributeName="stroke-dashoffset" from="3000" to="0" dur="3s" begin="0.5s" fill="freeze"/>
                    </path>


                    <path d="M 0 170 Q 300 50, 900 170 T 1800 170 T 2700 170"
                        stroke="url(#gradient3)" strokeWidth="4" fill="transparent" strokeLinecap="round"
                        strokeDasharray="2700" strokeDashoffset="2700"  filter="url(#blur1)">
                        <animate attributeName="stroke-dashoffset" from="2700" to="0" dur="3s" begin="1s" fill="freeze"/>
                    </path>
                </svg>
                <Translate
                    className="title wow animate__animated animate__fadeIn"
                    content="main_page.cwdex_stats.title"
                    component="h2"
                    data-wow-duration="2s"
                    data-wow-delay="0.2s"
                />

                <Translate
                    className="description wow animate__animated animate__fadeIn"
                    content="main_page.cwdex_stats.description"
                    data-wow-duration="2s"
                    data-wow-delay="0.4s"
                />
                <img className="background" src={chart} alt="chart" />
                <div className="dex-stats">
                    <div className="data-container wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.2s">
                        <Translate
                            className="daily-stats-view__legend"
                            content="main_page.cwdex_stats.24hr_deals_count"
                            data-wow-duration="2s"
                            data-wow-delay="0.6s"
                        />
                        <span className="daily-stats-view__amount">
                            <FormattedNumber
                                unitDisplay="long"
                                value={dealsCount}
                            />
                            <img src={tr} alt="tr" />
                        </span>
                    </div>

                    <div className="data-container wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.4s">
                        <Translate
                            className="daily-stats-view__legend"
                            content="main_page.cwdex_stats.deals_volume"
                        />
                        <span className="daily-stats-view__amount">
                            <FormattedNumber
                                unitDisplay="long"
                                value={dealsVolume}
                            />
                            <span className="daily-stats-view__asset">
                                    CWD
                            </span>
                            <img src={tr} alt="tr" />
                        </span>
                    </div>
                    <div className="data-container wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.6s">
                        <Translate
                            className="daily-stats-view__legend"
                            content="main_page.cwdex_stats.ex_rate"
                        />
                        <span className="daily-stats-view__amount">
                            <FormattedNumber
                                unitDisplay="long"
                                value={exRate}
                            />
                            <span className="daily-stats-view__asset">
                                    USD
                            </span>
                            <img src={tr} alt="tr" />
                        </span>
                    </div>
                </div>
            </section>
        );
    }
}

export default CWDexStats;
