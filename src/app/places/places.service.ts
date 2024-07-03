import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient)
  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places',"Unable to fetch Data")
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places',
      "Unable to fetch Data").pipe(tap({
        next:(userPlaces)=> this.userPlaces.set(userPlaces)
      } ))
  }

  addPlaceToUserPlaces(place: Place) {
    const previousResult = this.userPlaces()
    if( !previousResult.some((p)=> p.id===place.id) ){
      this.userPlaces.set([...previousResult,place])
    }
    
    return this.httpClient.put('http://localhost:3000/user-places',{
      placeId : place.id
    }).pipe(
      catchError(error=>{
        this.userPlaces.set(previousResult)
        return throwError( ()=> new Error('failed to load image') )
      })
    )
  }

  removeUserPlace(place: Place) {
    const previousResult = this.userPlaces()
    if( previousResult.some((p)=> p.id===place.id) ){
      this.userPlaces.set( previousResult.filter((p)=> p.id!==place.id) )
    }
    
    return this.httpClient.delete('http://localhost:3000/user-places/'+place.id).pipe(
      catchError(error=>{
        this.userPlaces.set(previousResult)
        return throwError( ()=> new Error('failed to remove image') )
      })
    )
  }

  private fetchPlaces(url:string,errorMsg:string){
    return this.httpClient.get<{places: Place[] }>(url).pipe(
      map((resData)=>resData.places), catchError((error,obs)=>throwError(()=> new Error('New Error') ))
    )
  }
}
