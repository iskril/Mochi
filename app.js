const modules_flsModules = {};
function functions_FLS(message) {
    setTimeout((() => {
        if (window.FLS) console.log(message);
    }), 0);
}
function uniqArray(array) {
    return array.filter((function (item, index, self) {
        return self.indexOf(item) === index;
    }));
}

class ScrollWatcher {
    constructor(props) {
        let defaultConfig = {
            logging: true
        };
        this.config = Object.assign(defaultConfig, props);
        this.observer;
        !document.documentElement.classList.contains("watcher") ? this.scrollWatcherRun() : null;
    }
    scrollWatcherUpdate() {
        this.scrollWatcherRun();
    }
    scrollWatcherRun() {
        document.documentElement.classList.add("watcher");
        this.scrollWatcherConstructor(document.querySelectorAll("[data-watch]"));
    }
    scrollWatcherConstructor(items) {
        if (items.length) {
            this.scrollWatcherLogging(`(${items.length})`);
            let uniqParams = uniqArray(Array.from(items).map((function (item) {
                return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : "0px"}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
            })));
            uniqParams.forEach((uniqParam => {
                let uniqParamArray = uniqParam.split("|");
                let paramsWatch = {
                    root: uniqParamArray[0],
                    margin: uniqParamArray[1],
                    threshold: uniqParamArray[2]
                };
                let groupItems = Array.from(items).filter((function (item) {
                    let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                    let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : "0px";
                    let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                    if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
                }));
                let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                this.scrollWatcherInit(groupItems, configWatcher);
            }));
        } else this.scrollWatcherLogging();
    }
    getScrollWatcherConfig(paramsWatch) {
        let configWatcher = {};
        if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root); else if (paramsWatch.root !== "null") this.scrollWatcherLogging(`${paramsWatch.root}`);
        configWatcher.rootMargin = paramsWatch.margin;
        if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) {
            this.scrollWatcherLogging();
            return;
        }
        if (paramsWatch.threshold === "prx") {
            paramsWatch.threshold = [];
            for (let i = 0; i <= 1; i += .005) paramsWatch.threshold.push(i);
        } else paramsWatch.threshold = paramsWatch.threshold.split(",");
        configWatcher.threshold = paramsWatch.threshold;
        return configWatcher;
    }
    scrollWatcherCreate(configWatcher) {
        this.observer = new IntersectionObserver(((entries, observer) => {
            entries.forEach((entry => {
                this.scrollWatcherCallback(entry, observer);
            }));
        }), configWatcher);
    }
    scrollWatcherInit(items, configWatcher) {
        this.scrollWatcherCreate(configWatcher);
        items.forEach((item => this.observer.observe(item)));
    }
    scrollWatcherOff(targetElement, observer) {
        observer.unobserve(targetElement);
        this.scrollWatcherLogging(`${targetElement.classList}`);
    }
    scrollWatcherLogging(message) {
        this.config.logging ? functions_FLS(`${message}`) : null;
    }
    scrollWatcherCallback(entry, observer) {
        const targetElement = entry.target;
        this.scrollWatcherIntersecting(entry, targetElement);
        targetElement.hasAttribute("data-watch-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
        document.dispatchEvent(new CustomEvent("watcherCallback", {
            detail: {
                entry
            }
        }));
    }
}
modules_flsModules.watcher = new ScrollWatcher({});
class Parallax {
    constructor(elements) {
        if (elements.length) this.elements = Array.from(elements).map((el => new Parallax.Each(el, this.options)));
    }
    destroyEvents() {
        this.elements.forEach((el => {
            el.destroyEvents();
        }));
    }
    setEvents() {
        this.elements.forEach((el => {
            el.setEvents();
        }));
    }
}
Parallax.Each = class {
    constructor(parent) {
        this.parent = parent;
        this.elements = this.parent.querySelectorAll("[data-prlx]");
        this.animation = this.animationFrame.bind(this);
        this.offset = 0;
        this.value = 0;
        this.smooth = parent.dataset.prlxSmooth ? Number(parent.dataset.prlxSmooth) : 15;
        this.setEvents();
    }
    setEvents() {
        this.animationID = window.requestAnimationFrame(this.animation);
    }
    destroyEvents() {
        window.cancelAnimationFrame(this.animationID);
    }
    animationFrame() {
        const topToWindow = this.parent.getBoundingClientRect().top;
        const heightParent = this.parent.offsetHeight;
        const heightWindow = window.innerHeight;
        const positionParent = {
            top: topToWindow - heightWindow,
            bottom: topToWindow + heightParent
        };
        const centerPoint = this.parent.dataset.prlxCenter ? this.parent.dataset.prlxCenter : "center";
        if (positionParent.top < 30 && positionParent.bottom > -30) switch (centerPoint) {
            case "top":
                this.offset = -1 * topToWindow;
                break;

            case "center":
                this.offset = heightWindow / 2 - (topToWindow + heightParent / 2);
                break;

            case "bottom":
                this.offset = heightWindow - (topToWindow + heightParent);
                break;
        }
        this.value += (this.offset - this.value) / this.smooth;
        this.animationID = window.requestAnimationFrame(this.animation);
        this.elements.forEach((el => {
            const parameters = {
                axis: el.dataset.axis ? el.dataset.axis : "v",
                direction: el.dataset.direction ? el.dataset.direction + "1" : "-1",
                coefficient: el.dataset.coefficient ? Number(el.dataset.coefficient) : 5,
                additionalProperties: el.dataset.properties ? el.dataset.properties : ""
            };
            this.parameters(el, parameters);
        }));
    }
    parameters(el, parameters) {
        if (parameters.axis == "v") el.style.transform = `translate3D(0, ${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0) ${parameters.additionalProperties}`; else if (parameters.axis == "h") el.style.transform = `translate3D(${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0,0) ${parameters.additionalProperties}`;
    }
};
if (document.querySelectorAll("[data-prlx-parent]")) modules_flsModules.parallax = new Parallax(document.querySelectorAll("[data-prlx-parent]"));
let addWindowScrollEvent = false;
setTimeout((() => {
    if (addWindowScrollEvent) {
        let windowScroll = new Event("windowScroll");
        window.addEventListener("scroll", (function (e) {
            document.dispatchEvent(windowScroll);
        }));
    }
}), 0);

const loader = document.querySelector('.loader');

setTimeout(() => {
    loader.classList.add('active')

}, 1200)

const burger = document.querySelector('.burger'),
    menuBody = document.querySelector('.menu__body'),
    scrollLock = document.querySelector('.scroll-lock'),
    body = document.querySelector('body'),
    burgerActive = document.querySelector('.burger--active'),
    paths = document.querySelectorAll('textPath'),
    howToBuyButtons = document.querySelectorAll('.how-to-buy__button'),
    howToBuyBooks = document.querySelectorAll('.how-to-buy-book__box');

howToBuyButtons.forEach((howToBuyButton, index) => {
    howToBuyButton.addEventListener('click', () => {
        howToBuyBooks.forEach((item) => {
            item.classList.remove('active')
            if (item === howToBuyBooks[index])
                item.classList.add('active');
        })
        howToBuyButtons.forEach((item) => {
            item.classList.remove('active')
        })
        howToBuyButton.classList.add('active')
    })
})

window.addEventListener('scroll', () => {
    paths[0].setAttribute('startOffset', window.scrollY * 0.6);
})

burger.addEventListener('click', () => {
    burger.classList.toggle('burger--active');
    menuBody.classList.toggle('menu__open');
    body.classList.toggle('scroll-lock');
})

window.addEventListener('scroll', () => {
    const showCat = document.querySelector('.content-buy-mochi__images'),
        showTextInBuyMochi = document.querySelector('.content-buy-mochi__title'),
        baseHeader = document.querySelector('.base__header'),
        baseHeaderTitle = document.querySelector('.base__header-title'),
        baseHeaderLabel = document.querySelector('.base__header-label'),
        baseClouds = document.querySelectorAll('.base__item-image'),
        baseItems = document.querySelector('.base__items'),
        itemsBody = document.querySelector('.items__body'),
        itemsSpan = document.querySelectorAll('.item-items__title > span'),
        howToBuyTitle = document.querySelector('.how-to-buy__title'),
        howToBuyTitleText = document.querySelectorAll('.how-to-buy__title > span'),
        roadMapTitie = document.querySelector('.road-map__title'),
        roadMapTitieText = document.querySelectorAll('.road-map__title > span'),
        joinBody = document.querySelector('.join__body'),
        JoinTitle = document.querySelectorAll('.join__title > span'),
        joinButton = document.querySelector('.join__button'),
        footerDecor = document.querySelector('.footer__decor'),
        footerDecorImg = document.querySelector('.footer__decor > img');

    if (window.scrollY >= 350) {
        showTextInBuyMochi.style.display = 'inline-block';
        showCat.style.animation = 'showCat .4s forwards';
        showCat.style.animationDelay = '1.6s';
    }
    if (window.scrollY >= baseHeader.getBoundingClientRect().top) {
        baseHeader.style.opacity = 1;
        baseHeaderTitle.style.display = 'inline-block';
        baseHeaderTitle.style.animation = 'text .4s forwards';
        baseHeaderLabel.style.display = 'block';
    }
    if (window.scrollY >= baseItems.getBoundingClientRect().bottom) {
        for (let item of baseClouds) {
            item.classList.add('animation-clouds')
        }
    }
    if (window.scrollY >= itemsBody.getBoundingClientRect().bottom + 800) {
        for (let item of itemsSpan) {
            item.classList.add('item-text-animation')
        }
    }
    if (window.scrollY >= howToBuyTitle.getBoundingClientRect().bottom + 2500) {
        for (let item of howToBuyTitleText) {
            item.classList.add('item-text-animation')
        }
    }
    if (window.scrollY >= roadMapTitie.getBoundingClientRect().bottom + 3000) {
        for (let item of roadMapTitieText) {
            item.classList.add('item-text-animation')
        }
    }
    if (window.scrollY >= joinBody.getBoundingClientRect().top + window.scrollY - 500) {
        for (let item of JoinTitle) {
            item.classList.add('item-text-animation')
            setTimeout(() => {
                joinButton.classList.add('active')
            }, 1200)
        }
    }
    if (window.scrollY >= footerDecor.getBoundingClientRect().top + window.scrollY - 999) {
        footerDecorImg.classList.add('active');
    }
})

const hoWtoBuyItem = document.querySelectorAll('.how-to-buy__item');
const howToBuyBottomButtons = document.querySelectorAll('.how-to-buy__bottom-button');

howToBuyBottomButtons.forEach((howToBuyBottomButton, index) => {
    howToBuyBottomButton.addEventListener('click', () => {
        hoWtoBuyItem.forEach((item) => {
            item.classList.remove('active')
            if (item === hoWtoBuyItem[index])
                item.classList.add('active')
        })
        howToBuyBottomButtons.forEach((item) => {
            item.classList.remove('active')
        })
        howToBuyBottomButton.classList.add('active')
    })
})
document.addEventListener('scroll', scrollAnimeTriggerCheck);

function scrollAnimeTriggerCheck() {
    const roadMapSteps = document.querySelector('.road-map__steps');
        animationRoadMap = document.getElementById('anima-line-1'),
        animationRoadMapLine2 = document.getElementById('anima-line-2'),
        animationRoadMapLine3 = document.getElementById('anima-line-3'),
        stepsItem = document.querySelectorAll('.steps-road-map__row'),
        colorLine = document.querySelector('.line-1'),
        colorLine2 = document.querySelector('.line-2'),
        colorLine3 = document.querySelector('.line-3'),
        stepsDecor = document.querySelector('.steps-road-map__row-road-image-decor');

    if (window.scrollY >= roadMapSteps.getBoundingClientRect().top + window.scrollY - 600) {
        setTimeout(() => {
            animationRoadMap.beginElement();
            colorLine.classList.add('active')
        }, 500);
        setTimeout(() => {
            animationRoadMapLine2.beginElement();
            colorLine2.classList.add('active')
        }, 2050);
        setTimeout(() => {
            animationRoadMapLine3.beginElement();
            colorLine3.classList.add('active')
        }, 3700);

        stepsItem.forEach(function (item) {
            item.classList.add('active');
        })
        stepsDecor.classList.add('active')

        document.removeEventListener('scroll', scrollAnimeTriggerCheck)
    }
}