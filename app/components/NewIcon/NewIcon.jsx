// look for more icons here https://linearicons.com/free or here http://hawcons.com/preview/

import React from "react";
import iconsMap from "../../assets/svg-images/_icons-loader.js";

require("./new-icon.scss");

class NewIcon extends React.Component {
    render() {
        let iconClass = this.props.iconClass;
        let width = this.props.iconWidth;
        let height = this.props.iconHeight;
        let name = this.props.iconName;
        let onClick = this.props.onClick;

        return (
            <span
                className={iconClass ? iconClass + " new-icon" : "new-icon"}
                style={{width: width + "px", height: height + "px"}}
                dangerouslySetInnerHTML={{__html: iconsMap[name]}}
                onClick={onClick}
            />
        );
    }
}

export default NewIcon;
