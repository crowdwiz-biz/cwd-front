import React from "react";
import prev from "assets/svg-images/svg-common/main-page/slider/prev.svg";
import next from "assets/svg-images/svg-common/main-page/slider/next.svg";
import slide1 from "assets/svg-images/svg-common/main-page/slider/slide1.svg";
import slide2 from "assets/svg-images/svg-common/main-page/slider/slide2.svg";
import slide3 from "assets/svg-images/svg-common/main-page/slider/slide3.svg";
import slide4 from "assets/svg-images/svg-common/main-page/slider/slide4.svg";
import slide5 from "assets/svg-images/svg-common/main-page/slider/slide5.svg";
import slide6 from "assets/svg-images/svg-common/main-page/slider/slide6.svg";
import slide7 from "assets/svg-images/svg-common/main-page/slider/slide7.svg";
import slide8 from "assets/svg-images/svg-common/main-page/slider/slide8.svg";
import { withRouter } from "react-router-dom";

import Translate from "react-translate-component";

class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSlide: 0,
            slides: [
                {
                    id: 1,
                    content: "main_page.slider.slide1.title",
                    img: slide1,
                    link: "/gateway/dex"
                },
                {
                    id: 2,
                    content: "main_page.slider.slide2.title",
                    img: slide2,
                    link: "/pledge-offer"
                },
                {
                    id: 3,
                    content: "main_page.slider.slide3.title",
                    link: "/gamezone",
                    img: slide3,
                },
                {
                    id: 4,
                    content: "main_page.slider.slide4.title",
                    img: slide4
                },
                {
                    id: 5,
                    content: "main_page.slider.slide5.title",
                    img: slide5,
                    link: "/contracts-overview"
                },
                {
                    id: 6,
                    content: "main_page.slider.slide6.title",
                    img: slide6,
                    link: "/great-race"
                },
                {
                    id: 7,
                    content: "main_page.slider.slide7.title",
                    img: slide7,
                    link: "/settings"
                },
                {
                    id: 8,
                    content: "main_page.slider.slide8.title",
                    img: slide8,
                    link: "/address-book"
                },
            ],
        };
    }

    goToNextSlide = () => {
        const { currentSlide, slides } = this.state;
        this.setState({
            currentSlide: (currentSlide + 1) % slides.length,
        });
    };

    goToPrevSlide = () => {
        const { currentSlide, slides } = this.state;
        this.setState({
            currentSlide: (currentSlide - 1 + slides.length) % slides.length,
        });
    };

    handleTitleClick = (link) => {
        if (!link) {
            return;
        };
        this.props.history.push(link);
    }

    render() {
        const { currentSlide, slides } = this.state;

        return (
            <div className="slider">
                <div
                    className="slides-container wow animate__animated animate__pulse"
                    style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                        transition: "transform 0.5s ease-in-out",
                    }}
                    data-wow-delay="0.6s"
                    data-wow-duration="1s"
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            className="slide"
                            style={{ backgroundColor: slide.background }}
                        >
                            <div className="image-wrapper"><img src={slide.img} alt={slide.content} /></div>
                            <Translate
                                className="subtitle"
                                content="main_page.slider.description"
                                component="div"
                            />
                            <Translate
                                className="title"
                                content={slide.content}
                                component="div"
                                onClick={() => this.handleTitleClick(slide.link)}
                            />
                        </div>
                    ))}
                </div>
                <div className="slider-navigation">
                    <button className="prev-button" onClick={this.goToPrevSlide}>
                        <img src={prev} alt="prev" />
                    </button>
                    <div className="counter">
                        {currentSlide + 1}<span>/{slides.length}</span>
                    </div>
                    <button className="next-button" onClick={this.goToNextSlide}>
                        <img src={next} alt="prev" />
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(Slider);
