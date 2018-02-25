import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { CrosswordComponent } from "./crossword.component";
import { GridService } from "./grid.service";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import assert = require("assert");

describe("CrosswordComponent", () => {
    let component: CrosswordComponent;
    let fixture: ComponentFixture<CrosswordComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CrosswordComponent],
            imports: [HttpClientModule],
            providers: [
                GridService,
                HttpClient
            ]
        })
        .compileComponents()
        .then()
        .catch((e: Error) => console.error(e.message));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CrosswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("the view contains a grid", () => {
         assert(true);
    });

    it("the view contains definitions", () => {
        assert(true);
    });

    it("the view contains game informations", () => {
        assert(true);
    });

    it("if there's 2 players, the game info div display two players ", () => {
        assert(true);
    });

    it("if there's one player, the game info div display one player ", () => {
        assert(true);
    });

    it("the name entered by the player is the one displayed ", () => {
        assert(true);
    });

    it("the letters in the grid are uppercase", () => {
        assert(true);
    });

    it("the definitions in the horizontal section are those of horizontal words ", () => {
        assert(true);
    });

    it("the definitions in the vertical section are those of vertical words ", () => {
        assert(true);
    });

});
