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
            <section className="mp-center-wrap gamezone-wrapper">
                <Translate
                    className="title wow animate__animated animate__fadeIn"
                    content="main_page.gamezone_stats.title"
                    component="h2"
                    data-wow-duration="2s"
                    data-wow-delay="0.2s"
                />

                <Translate
                    className="description wow animate__animated animate__fadeIn"
                    content="main_page.gamezone_stats.description"
                    data-wow-duration="2s"
                    data-wow-delay="0.4s"
                />
                <div className="content">
                    <div className="effects">
                        <svg xmlns="http://www.w3.org/2000/svg" width="138" height="184" viewBox="0 0 138 184" fill="none">
                            <path opacity="0.8" d="M15.7168 1.95102C9.08711 -2.66837 0 2.07544 0 10.1558V48.3562C0 51.6254 1.59801 54.6882 4.27948 56.5584L43.3716 83.8228C49.0803 87.8042 49.077 96.2545 43.3653 100.232L4.28583 127.442C1.60067 129.312 0 132.377 0 135.649V173.851C0 181.93 9.08444 186.674 15.7144 182.058L133.218 100.236C138.932 96.2574 138.933 87.8043 133.221 83.8244L15.7168 1.95102Z" fill="url(#paint0_linear_1_65)"/>
                            <defs>
                                <linearGradient id="paint0_linear_1_65" x1="-0.00153724" y1="-9.00116" x2="145.008" y2="-9.00116" gradientUnits="userSpaceOnUse">
                                    <stop stopOpacity="0"/>
                                    <stop offset="1" stopColor="#DEC27F"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="233" height="314" viewBox="0 0 233 314" fill="none">
                            <path opacity="0.8" d="M15.6893 1.85382C9.05668 -2.7346 0 2.01265 0 10.0777V88.6503C0 91.932 1.61013 95.0048 4.30841 96.8726L79.3324 148.805C85.0786 152.783 85.0766 161.278 79.3285 165.253L4.31227 217.128C1.61175 218.995 0 222.069 0 225.353V303.926C0 311.991 9.05505 316.738 15.6878 312.151L228.109 165.255C233.858 161.279 233.858 152.783 228.11 148.806L15.6893 1.85382Z" fill="url(#paint0_linear_1_61)"/>
                            <defs>
                                <linearGradient id="paint0_linear_1_61" x1="-0.00254439" y1="-9.0019" x2="240.013" y2="-9.0019" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#DEC27F" stopOpacity="0"/>
                                    <stop offset="1" stopColor="#DEC27F"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="232" height="314" viewBox="0 0 232 314" fill="none">
                            <path opacity="0.8" d="M15.7054 1.91041C9.07443 -2.69605 0 2.04918 0 10.1231V88.6627C0 91.9375 1.6034 95.0048 4.29235 96.8739L79.0179 148.816C84.7426 152.796 84.7406 161.265 79.014 165.241L4.29621 217.126C1.60502 218.995 0 222.064 0 225.34V303.881C0 311.954 9.07278 316.7 15.7039 312.095L227.174 165.244C232.902 161.267 232.902 152.796 227.176 148.817L15.7054 1.91041Z" fill="url(#paint0_linear_1_62)"/>
                            <defs>
                                <linearGradient id="paint0_linear_1_62" x1="-0.00253379" y1="-9.0019" x2="239.013" y2="-9.0019" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#DEC27F" stopOpacity="0"/>
                                    <stop offset="1" stopColor="#DEC27F"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="232" height="314" viewBox="0 0 232 314" fill="none">
                            <path opacity="0.8" d="M15.7054 1.91041C9.07443 -2.69605 0 2.04918 0 10.1231V88.6607C0 91.9366 1.60452 95.0048 4.29503 96.8737L79.0703 148.815C84.7986 152.794 84.7966 161.267 79.0664 165.243L4.2989 217.127C1.60615 218.995 0 222.065 0 225.342V303.881C0 311.954 9.07278 316.7 15.7039 312.095L227.174 165.244C232.902 161.267 232.902 152.796 227.176 148.817L15.7054 1.91041Z" fill="url(#paint0_linear_1_63)"/>
                            <defs>
                                <linearGradient id="paint0_linear_1_63" x1="-0.00253379" y1="-9.0019" x2="239.013" y2="-9.0019" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#DEC27F" stopOpacity="0"/>
                                    <stop offset="1" stopColor="#DEC27F"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="138" height="184" viewBox="0 0 138 184" fill="none">
                            <path opacity="0.8" d="M15.7168 1.95102C9.08711 -2.66837 0 2.07544 0 10.1558V48.3562C0 51.6254 1.59801 54.6882 4.27948 56.5584L43.3716 83.8228C49.0803 87.8042 49.077 96.2545 43.3653 100.232L4.28583 127.442C1.60067 129.312 0 132.377 0 135.649V173.851C0 181.93 9.08444 186.674 15.7144 182.058L133.218 100.236C138.932 96.2574 138.933 87.8043 133.221 83.8244L15.7168 1.95102Z" fill="url(#paint0_linear_1_64)"/>
                            <defs>
                                <linearGradient id="paint0_linear_1_64" x1="-0.00153724" y1="-9.00116" x2="145.008" y2="-9.00116" gradientUnits="userSpaceOnUse">
                                    <stop stopOpacity="0"/>
                                    <stop offset="1" stopColor="#DEC27F"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="col wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.2s">
                        <Translate
                            className="subtitle"
                            content="main_page.gamezone_stats.24hr_volume"
                        />
                        <span className="amount">
                            <FormattedNumber
                                unitDisplay="long"
                                value={gamesVolume}
                            />
                            <span className="daily-stats-view__asset">
                                    CWD
                            </span>
                        </span>
                    </div>

                    <div className="col wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.4s">
                        <Translate
                            className="subtitle"
                            content="main_page.gamezone_stats.24hr_games_count"
                        />
                        <span className="count">
                            <FormattedNumber
                                unitDisplay="long"
                                value={gamesCount}
                            />
                        </span>
                    </div>
                </div>
            </section>
        );
    }
}

export default GamezoneStats;
