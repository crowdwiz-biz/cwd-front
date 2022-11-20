import React from "react";
import Translate from "react-translate-component";
import CrowdProjectsItem from "./utility/CrowdProjectsItem";

// IMAGES
import img_01 from "assets/png-images/cwd-projects/global_safe_icon.png";
import img_02 from "assets/png-images/cwd-projects/playbet_icon.png";
import img_03 from "assets/png-images/cwd-projects/cwd-casino_icon.png";
import img_04 from "assets/png-images/cwd-projects/global_trip.png";
import img_05 from "assets/png-images/cwd-projects/crowd-capital_icon.png";
import img_06 from "assets/png-images/cwd-projects/crowdskills_icon.png";

class CrowdProjects extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            projectsData: [
                {
                    img: img_01,
                    url: "https://globalsafe.me"
                },
                {
                    img: img_02,
                    url: "https://playbet.game/"
                },
                {
                    img: img_03,
                    url: "https://cwd.casino"
                },
                {
                    img: img_04,
                    url: "https://t.me/Crowd_global_trip_bot"
                },
                {
                    img: img_05,
                    url: "https://t.me/fond_du_bot"
                },
                {
                    img: img_06,
                    url: "https://taplink.cc/_crowdskills_"
                }
            ]
        };
    }
    render() {
        let projectsData = this.state.projectsData;
        let nameCounter = 1;

        return (
            <section className="mp-center-wrap">
                <div className="mp-center-wrap mp-common__inner">
                    <div className="mp-common__left-column">
                        <Translate
                            className="mp-common__title"
                            content="main_page.crowd_projects.tltle"
                            component="h2"
                        />
                    </div>

                    <ul className="mp-common__right-column crowd-progects__container">
                        {projectsData.map((projectItem, index) => (
                            <CrowdProjectsItem
                                key={index}
                                projectItem={projectItem}
                                nameCounter={nameCounter++}
                            />
                        ))}
                    </ul>
                </div>
            </section>
        );
    }
}

export default CrowdProjects;
