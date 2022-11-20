import React from "react";
import Translate from "react-translate-component";

class CrowdProjectsItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let projectItem = this.props.projectItem;
        let nameCounter = this.props.nameCounter;

        return (
            <li className="crowd-progects__item">
                <a
                    href={projectItem.url}
                    className="crowd-progects__link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className="crowd-progects__img">
                        <img src={projectItem.img} />
                    </div>

                    <Translate
                        className="crowd-progects__name"
                        content={
                            "main_page.crowd_projects.project_" + nameCounter
                        }
                    />
                </a>
            </li>
        );
    }
}

export default CrowdProjectsItem;
