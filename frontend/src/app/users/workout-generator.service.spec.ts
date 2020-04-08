import { WorkoutGeneratorService } from "./workout-generator.service";
import { WorkoutsService } from "./workouts.service";
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';
import { Workout } from './workout';
import { Plan } from './plan';
import { PlanSession } from './plan-session';
import { getInterpolationArgsLength } from '@angular/compiler/src/render3/view/util';
import { ProgressionStrategy } from './plan-progression-strategy';
import { WorkingWeight } from './working-weight';
import { PlanSessionGroup } from './plan-session-group';
import { WorkoutGroup } from './workout-group';

describe('WorkoutGeneratorService', () => {
    let start: Date;

    let plan: Plan;
    let planProgressions: ProgressionStrategy[];

    let planSession: PlanSession;
    let planSessionProgressions: ProgressionStrategy[];

    let lastWorkout: Workout;

    let workingWeights: WorkingWeight[];

    let service: WorkoutGeneratorService;
    let workoutServiceSpy: jasmine.SpyObj<WorkoutsService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => { 
        start = new Date();

        workingWeights = [];

        planSession = new PlanSession();
        planSessionProgressions = [];
        planSession.progressions = planSessionProgressions;

        plan = new Plan();
        planProgressions = [];

        plan.progressions = planProgressions;
        plan.sessions = [planSession];

        workoutServiceSpy = jasmine.createSpyObj('WorkoutsService', ['getLastWorkout']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsername']);

        lastWorkout = new Workout();
        lastWorkout.id = 1;
        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));
        authServiceSpy.getUsername.and.returnValue('username');

        service = new WorkoutGeneratorService(workoutServiceSpy, authServiceSpy); 
    });

    describe('#generate', () => {
        describe('when no last workout available', () => {
            beforeEach(() =>{
                workoutServiceSpy.getLastWorkout.and.returnValue(of(null));
            });

            describe('when multiple groups with same order', () => {
                it('should select first group with same order', () => {
                    const expected = new PlanSessionGroup({id: 1, order: 1});
                    const decoy = new PlanSessionGroup({id: 2, order: 1});

                    planSession.groups = [expected, decoy];

                    exerciseGenerate().subscribe(workout => {
                        expect(workout.groups.length).toEqual(1);
                        expect(workout.groups[0].plan_session_group).toEqual(1);
                    });
                });
            });
        });

        describe('when last workout available', () => {
            describe('when multiple groups with same order', () => {
                describe('when not at final group', () => {
                    beforeEach(() => {
                        const decoy = new PlanSessionGroup({id: 1, order: 1});
                        const expected = new PlanSessionGroup({id: 3, order: 1});
                        const workoutGroup = new WorkoutGroup({plan_session_group: decoy.id, order: 1});

                        lastWorkout.groups = [workoutGroup];
                        planSession.groups = [expected, decoy];
                    });

                    it('should select the group with a bigger id than the one in the last workout', () => {
                        exerciseGenerate().subscribe(workout => {
                            expect(workout.groups.length).toEqual(1);
                            expect(workout.groups[0].plan_session_group).toEqual(3);
                        });
                    });
                });

                describe('when already at final group', () => {
                    beforeEach(() => {
                        const expected = new PlanSessionGroup({id: 2, order: 1});
                        const decoy = new PlanSessionGroup({id: 30, order: 1});
                        const anotherDecoy = new PlanSessionGroup({id: 12, order: 1});
                        const workoutGroup = new WorkoutGroup({plan_session_group: 30, order: 1});

                        lastWorkout.groups = [workoutGroup];
                        planSession.groups = [anotherDecoy, expected, decoy];
                    });

                    it('should select the group with the lowest id', () => {
                        exerciseGenerate().subscribe(workout => {
                            expect(workout.groups.length).toEqual(1);
                            expect(workout.groups[0].plan_session_group).toEqual(2);
                        });
                    });
                });
            });
        });
    });

    function exerciseGenerate() : Observable<Workout> {
        return service.generate(start, workingWeights, plan, planSession);
    }
});