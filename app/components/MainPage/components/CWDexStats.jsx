import React from "react";
import Translate from "react-translate-component";
import {FormattedNumber} from "react-intl";

class CWDexStats extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {dealsCount, dealsVolume, exRate} = this.props;

        return (
            <section className="mp-center-wrap">
                <div className="mp-center-wrap mp-common__inner">
                    <div className="mp-common__left-column">
                        <Translate
                            className="mp-common__title"
                            content="main_page.cwdex_stats.title"
                            component="h2"
                        />

                        <Translate
                            className="mp-common__description"
                            content="main_page.cwdex_stats.description"
                        />
                    </div>

                    <div className="mp-common__right-column daily-stats-view__right-column daily-stats-view__right-column--dex-stats">
                        <div className="daily-stats-view__data-container">
                            <Translate
                                className="daily-stats-view__legend"
                                content="main_page.cwdex_stats.24hr_deals_count"
                            />
                            <span className="daily-stats-view__amount">
                                <FormattedNumber
                                    unitDisplay="long"
                                    value={dealsCount}
                                />
                            </span>
                        </div>

                        <div className="daily-stats-view__data-container">
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
                            </span>
                        </div>

                        <div className="daily-stats-view__data-container daily-stats-view__data-container--full-width">
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
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default CWDexStats;
