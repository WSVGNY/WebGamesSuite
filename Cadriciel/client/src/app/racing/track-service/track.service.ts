import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { catchError } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { TrackStructure } from "../../../../../common/racing/track";

@Injectable()
export class TrackService {

    private readonly BASE_URL: string = "http://localhost:3000/track";
    private readonly httpOptions: { headers: HttpHeaders; } = {
        headers: new HttpHeaders({
        })
    };

    public constructor(private http: HttpClient) { }

    public getTrackList(): Observable<string> {
        return this.http.get<string>(this.BASE_URL).pipe(
            catchError(this.handleError<string>("getTrackList"))
        );
    }

    public getTrackFromId(id: string): Observable<string> {
        return this.http.get<string>(this.BASE_URL + "/" + id).pipe(
            catchError(this.handleError<string>("getTrackFromId"))
        );
    }

    public newTrack(trackName: string): Observable<string> {
        const newTrack: TrackStructure = TrackStructure.getNewDefaultTrackStructure();
        newTrack.name = trackName;

        return this.http.post<string>(this.BASE_URL + "/new", newTrack, this.httpOptions).pipe(
            catchError(this.handleError<string>("newTrack"))
        );
    }

    public putTrack(trackId: string, track: TrackStructure): Observable<string> {
        return this.http.put<string>(this.BASE_URL + "/put/" + trackId, track, this.httpOptions).pipe(
            catchError(this.handleError<string>("putTrack"))
        );
    }

    public deleteTrack(trackId: string): Observable<string> {
        return this.http.delete<string>(this.BASE_URL + "/delete/" + trackId, this.httpOptions).pipe(
            catchError(this.handleError<string>("deleteTrack"))
        );
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
