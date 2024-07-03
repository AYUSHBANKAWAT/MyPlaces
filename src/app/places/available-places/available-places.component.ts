import { Component, signal,inject, OnInit, DestroyRef } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],

})
export class AvailablePlacesComponent implements OnInit {
places = signal<Place[] | undefined>(undefined);
isFetching = signal(false)
error = signal('')
private placeServices = inject(PlacesService)
private destroyRef = inject(DestroyRef)
ngOnInit(){
  this.isFetching.set(true)
  const subscription = this.placeServices.loadAvailablePlaces().subscribe({
    next: (places)=> {
      this.places.set(places)
    },
    complete:()=>{
      this.isFetching.set(false)
    },
    error:(error)=>{
      this.error.set(error.message)
    }

  });
  this.destroyRef.onDestroy(()=>{
    subscription.unsubscribe()
  })
}

onSelectPlace(selectedPlace:Place){
  const subscription = this.placeServices.addPlaceToUserPlaces(selectedPlace).subscribe({
    next:(resData)=>{
      console.log(resData)
    },
    complete:()=>{
      console.log('Place pushed')
    }
  })
  this.destroyRef.onDestroy(()=>{
    subscription.unsubscribe()
  })

}

}
