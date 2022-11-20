import React from "react";
import Translate from "react-translate-component";
import {FormattedNumber} from "react-intl";

class GamezoneStats extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {gamesCount, gamesVolume} = this.props;

        return (
            <section className="mp-center-wrap">
                <div className="mp-center-wrap mp-common__inner">
                    <div className="mp-common__left-column">
                        <Translate
                            className="mp-common__title"
                            content="main_page.gamezone_stats.title"
                            component="h2"
                        />

                        <Translate
                            className="mp-common__description"
                            content="main_page.gamezone_stats.description"
                        />
                    </div>

                    <div className="mp-common__right-column daily-stats-view__right-column">
                        <div className="daily-stats-view__data-container">
                            <Translate
                                className="daily-stats-view__legend"
                                content="main_page.gamezone_stats.24hr_games_count"
                            />
                            <span className="daily-stats-view__amount">
                                <FormattedNumber
                                    unitDisplay="long"
                                    value={gamesCount}
                                />
                            </span>
                        </div>

                        <div className="daily-stats-view__data-container">
                            <Translate
                                className="daily-stats-view__legend"
                                content="main_page.gamezone_stats.24hr_volume"
                            />
                            <span className="daily-stats-view__amount">
                                <FormattedNumber
                                    unitDisplay="long"
                                    value={gamesVolume}
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

export default GamezoneStats;
