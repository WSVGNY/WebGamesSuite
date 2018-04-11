import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EndGameTableComponent } from "./end-game-table.component";
import { HighscoreService } from "../best-times/highscore.service";
import { InputTimeService } from "../input-time/input-time.service";
import { EndGameTableService } from "./end-game-table.service";
import { CarTrackingManagerService } from "../../carTracking-manager/car-tracking-manager.service";

describe("EndGameTableComponent", () => {
    let component: EndGameTableComponent;
    let fixture: ComponentFixture<EndGameTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EndGameTableComponent],
            providers: [HighscoreService, InputTimeService, EndGameTableService, CarTrackingManagerService]
        }).compileComponents().then().catch((e: Error) => console.error(e.message));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EndGameTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
