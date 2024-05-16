import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  templateUrl: './selector-page.component.html',
  styles: []
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['',Validators.required],
    country: ['',Validators.required],
    border: ['',Validators.required],

  });

  constructor(
    private fb: FormBuilder,
    private countryService: CountriesService
  ){

  }
  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region []{
    return this.countryService.regions;
  }

  onRegionChanged() {
    this.myForm.get('region')!.valueChanges
    .pipe(
      //Efecto secundario
      tap( () => this.myForm.controls['country'].setValue('')),
      tap( () => this.borders = []),
      switchMap(region => this.countryService.getCountriesByRegion(region))
    )
    .subscribe(
      countries => {
        this.countriesByRegion = countries;
      }
    )
  }

  onCountryChanged() {
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap( () => this.myForm.controls['border'].setValue('')),
      //Si la condición no es true, ya no emite los eventos.
      filter((value:string) => value.length > 0),
      switchMap(alphaCode => this.countryService.getCountryByAlphaCode(alphaCode)),
      switchMap ( (country) => this.countryService.getCountryBordersByCodes(country.borders))
    )
    .subscribe(
      borders => {
        this.borders = borders;
      }
    )
  }
}
