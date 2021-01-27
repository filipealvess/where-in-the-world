// Declarations
const countriesContainer = document.querySelector('.countries');
const popupContainer = document.querySelector('.popup');
const countryFlagPopup = document.querySelector('.country-flag');
const countryInfoPopup = document.querySelector('.country-informations');
const loaderContainer = document.querySelector('.loader');
const filterContainer = document.querySelector('.filter');
const successfulMessageContainer = document.querySelector('.successful-message');
const notFoundContainer = document.querySelector('.not-found');
const selectedOption = document.querySelector('.selected-option');
const themeSwitcher = document.querySelector('.theme-switcher');
const searchField = document.querySelector('.search-field');
const filterOptions = document.querySelectorAll('[data-option]');
const btnClosePopup = document.querySelector('.close');

let countryStartingPosition = 0;
let allCountries;

// Functions
async function fetchCountries() {
	const parameters = [
		'name',
		'flag',
		'nativeName',
		'topLevelDomain',
		'population',
		'currencies',
		'region',
		'languages',
		'subregion',
		'capital',
		'borders',
		'cioc'
	];
	const url = 'https://restcountries.eu/rest/v2/all?fields=';
	const response = await fetch(url + parameters.join(';'));
	return await response.json();
}

function loadCountries() {
	const numberOfCountries = 10;
	const countries = allCountries.filter(country => country.isVisible);
	const allCountriesWereLoaded = countries.length === countriesContainer.childElementCount;
	const countryIsNotFound = countries.length === 0;
	const loopEnd = countryStartingPosition + numberOfCountries <= countries.length
		? countryStartingPosition + numberOfCountries
		: countries.length;

	notFoundContainer.classList.remove('show');

	if (countryIsNotFound) {
		notFoundContainer.classList.add('show');
		return;
	}

	if (allCountriesWereLoaded) {
		successfulMessageContainer.classList.add('show');
			
		setTimeout(() => {
			successfulMessageContainer.classList.remove('show');
		}, 2000);

		return;
	}

	for(let i = countryStartingPosition; i < loopEnd; i++) {
		const {name, flag, population, region, capital} = countries[i];
		const countryPosition = getCountryPosition(name);

		const html = `
			<article class="country" onclick="fillPopup(${countryPosition})">
				<div class="flag">
					<img src="${flag}" alt="${name}'s flag">
				</div>

				<div class="country-infos">
					<h2 class="country-name">${name}</h2>
					<p>
						<span class="strong">Population:</span> ${population}
					</p>
					<p>
						<span class="strong">Region:</span> ${region}
					</p>
					<p>
						<span class="strong">Capital:</span> ${capital}
					</p>
				</div>
			</article>`;

		countriesContainer.innerHTML += html;
	}
	
	countryStartingPosition += numberOfCountries;
}

function getCountryPosition(countryName) {
	let countryPosition;

	allCountries.forEach((country, index) => {
		if (country.name === countryName) {
			countryPosition = index;
		}
	});

	return countryPosition;
}

function showLoader() {
	loaderContainer.classList.add('active');
	
	setTimeout(() => {
		loaderContainer.classList.remove('active');

		loadCountries();
	}, 1000);
}

function toggleTheme() {
	document.body.classList.toggle('dark');
	themeSwitcher.classList.toggle('active');
}

function toggleFilterVisibility() {
	filterContainer.classList.toggle('active');
}

function handleFilterOptions({target}) {
	const option = target.dataset.option;
	const optionText = target.innerText;

	filterOptions.forEach(filterOption => {
		filterOption.classList.remove('strong');
	});

	selectedOption.innerText = optionText;
	target.classList.add('strong');

	toggleFilterVisibility();

	searchField.value = '';
	countriesContainer.innerHTML = '';
	countryStartingPosition = 0;

	allCountries.forEach(country => {
		country.isVisible = false;
		
		if (country.region === optionText) {
			country.isVisible = true;
		}
	});

	if (option === 'all') {
		allCountries.forEach(country => {
			country.isVisible = true;
		});
	}

	loadCountries();
}

function handlePageScroll() {
	const { clientHeight, scrollHeight, scrollTop } = document.documentElement;
	const isPageBottomAlmostReached = scrollTop + clientHeight >= scrollHeight - 10;

	if (isPageBottomAlmostReached) {
		showLoader();
	}
}

async function handlePageLoad() {
	allCountries = await fetchCountries();

	allCountries.forEach(country => { country.isVisible = true });

	loadCountries();
}

function handleSearchInput({target}) {
	const inputValue = target.value;
	const selectedFilterOption = selectedOption.innerText;
	
	countriesContainer.innerHTML = '';
	countryStartingPosition = 0;

	if (inputValue.length === 0) {
		allCountries.forEach(country => { country.isVisible = true });
		
		loadCountries();
		
		return;
	}

	allCountries.forEach(country => {
		const selectedOptionIsAll = (selectedFilterOption === 'All countries');
		const countryRegionIsEqualToSelected = (country.region === selectedFilterOption);
		const countryContainsSearchValue = country.name.toLowerCase()
			.includes(inputValue.toLowerCase());
		const countryBelongsToTheSelectedRegion =	selectedOptionIsAll || countryRegionIsEqualToSelected;

		country.isVisible = false;

		if (countryContainsSearchValue && countryBelongsToTheSelectedRegion) {
			country.isVisible = true;
		}
	});

	loadCountries();
}

filterOptions.forEach(filterOption => {
	filterOption.addEventListener('click', handleFilterOptions);
});

function closePopup() {
	popupContainer.classList.remove('active');
}

function showPopup() {
	popupContainer.classList.add('active');
}

function fillPopup(countryPosition) {
	const {
		name,
		nativeName,
		flag,
		topLevelDomain,
		population,
		currencies,
		region,
		languages,
		subregion,
		capital,
		borders
	} = allCountries[countryPosition];

	const countryCurrencies = currencies.map(currency => currency.name);
	const countryLanguages = languages.map(language => language.name);

	const countryBorders = borders.map(border => {
		let countryBorder = '';

		allCountries.forEach(country => {
			if (country.cioc === border) {
				countryBorder = country.name;
			}
		});

		return countryBorder;
	}).filter(border => border !== '');

	const countryFlag = `
		<img src="${flag}" alt="${name}'s flag">
	`;

	let countryInfos = `
		<p class="name">${name}</p>

		<p class="info">
			<span class="strong">Native Name:</span> ${nativeName}
		</p>
		<p class="info">
			<span class="strong">Top Level Domain:</span> ${topLevelDomain.join(' ')}
		</p>
		<p class="info">
			<span class="strong">Population:</span> ${population}
		</p>
		<p class="info">
			<span class="strong">Currencies:</span> ${countryCurrencies.join(', ')}
		</p>
		<p class="info">
			<span class="strong">Region:</span> ${region}
		</p>
		<p class="info">
			<span class="strong">Languages:</span> ${countryLanguages.join(', ')}
		</p>
		<p class="info">
			<span class="strong">Sub Region:</span> ${subregion}
		</p>
		<p class="info">
			<span class="strong">Capital:</span> ${capital}
		</p>

		<div class="border-countries">
			<span class="strong">Border Countries: </span>
	`;

	countryBorders.forEach(countryBorder => {
		countryInfos += `
			<span
				class="border-country"
				onclick="fillPopup(${getCountryPosition(countryBorder)})"
			>
				${countryBorder}
			</span>`;
	});

	countryInfos += `</div>`;

	countryFlagPopup.innerHTML = countryFlag;
	countryInfoPopup.innerHTML = countryInfos;

	showPopup();
}

// Event Listeners
btnClosePopup.addEventListener('click', closePopup);
themeSwitcher.addEventListener('click', toggleTheme);
selectedOption.addEventListener('click', toggleFilterVisibility);
searchField.addEventListener('input', handleSearchInput);
window.addEventListener('load', handlePageLoad);
window.addEventListener('scroll', handlePageScroll);