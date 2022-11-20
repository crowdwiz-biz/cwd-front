import React from "react";
import Translate from "react-translate-component";

class FooterLinklItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let linkData = this.props.linkData;

        return (
            <li className="mp-footer__link-item noselect">
                <a href={linkData.url} rel="noopener noreferrer">
                    <Translate content={"main_page.footer." + linkData.text} />
                </a>
            </li>
        );
    }
}

export default FooterLinklItem;
