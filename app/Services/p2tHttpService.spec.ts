import { TestBed } from '@angular/core/testing';
import { p2tHttpService } from './p2tHttpService';



describe('httpService', () => {
  let service: p2tHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(p2tHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
