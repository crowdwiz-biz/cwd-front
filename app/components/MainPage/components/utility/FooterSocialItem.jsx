import React from "react";
import NewIcon from "../../../NewIcon/NewIcon";

class FooterSocialItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let socialData = this.props.socialData;
        let containerWidth = window.innerWidth;

        return (
            <li className="mp-footer__social-item">
                <a href={socialData.url} rel="noopener noreferrer">
                    <NewIcon
                        iconWidth={containerWidth > 767 ? 27 : 18}
                        iconHeight={containerWidth > 767 ? 27 : 18}
                        iconName={socialData.img}
                    />
                </a>
            </li>
        );
    }
}

export default FooterSocialItem;
