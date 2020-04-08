import { WorkoutGeneratorService } from "./workout-generator.service";
import { WorkoutsService } from "./workouts.service";
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';
import { Workout } from './workout';
import { Plan } from './plan';
import { PlanSession } from './plan-session';
import { ProgressionStrategy } from './plan-progression-strategy';
import { WorkingWeight } from './working-weight';
import { PlanSessionGroup } from './plan-session-group';
import { WorkoutGroup } from './workout-group';
import { PlanSessionGroupActivity } from './plan-session-group-activity';
import { Exercise } from './exercise';

describe('WorkoutGeneratorService', () => {
    let start: Date;

    let plan: Plan;
    let planProgressions: ProgressionStrategy[];

    let planSession: PlanSession;
    let planSessionProgressions: ProgressionStrategy[];

    let lastWorkout: Workout;

    let working_weights: WorkingWeight[];

    let username: string = 'username';
    let userWeightUnitId: number = 60;
    let anotherUnitId: number = 30;

    let service: WorkoutGeneratorService;
    let workoutServiceSpy: jasmine.SpyObj<WorkoutsService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => { 
        start = new Date();

        working_weights = [];

        planSession = new PlanSession();
        planSession.id = 10;
        planSessionProgressions = [];
        planSession.progressions = planSessionProgressions;

        plan = new Plan();
        plan.id = 10;
        planProgressions = [];

        plan.progressions = planProgressions;
        plan.sessions = [planSession];

        workoutServiceSpy = jasmine.createSpyObj('WorkoutsService', ['getLastWorkout']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsername']);

        lastWorkout = new Workout();
        lastWorkout.id = 1;
        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));
        authServiceSpy.getUsername.and.returnValue(username);
        authServiceSpy.getUserWeightUnitId.and.returnValue(userWeightUnitId.toString());

        service = new WorkoutGeneratorService(workoutServiceSpy, authServiceSpy); 
    });

    describe('#updateWeights', () => {
    })

    describe('#getWorkoutName', () => {
    })

    describe('#generate', () => {
        it('should set workout fields based on parameters received', () => {
            exerciseGenerate().subscribe(workout => {
                expect(workout.start).toEqual(start);
                expect(workout.plan).toEqual(plan.id)
                expect(workout.plan_session).toEqual(planSession.id)
            });
        });

        it('should set workout name according to start date and plan session', () => {
            start = new Date(2020,4,8);
             
            planSession.name = "workout a";

            exerciseGenerate().subscribe(workout => {
                expect(workout.name).toEqual(start.toLocaleDateString('en-us', { weekday: 'long' }) + "'s" + " " + planSession.name);
            });
        });

        describe('when plan session contains groups with warmups', () => {
            beforeEach(() => {
                let group = new PlanSessionGroup({
                    order: 1,
                    warmups: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 1})}
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({id: 2})}
                        ),
                    ]});
                let anotherGroup = new PlanSessionGroup({
                    order: 2,
                    warmups: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 1})}
                        ),
                    ]});
                planSession.groups = [group, anotherGroup];
            });

            it('should generate workout warmups', () => {
                exerciseGenerate().subscribe(workout => {
                    expect(workout.groups.length).toEqual(2);
                    expect(workout.groups[0].warmups.length).toEqual(2);
                    expect(workout.groups[0].warmups.map(x => x.exercise.id).sort((a,b) => a - b)).toEqual([1,2]);
                    expect(workout.groups[1].warmups.length).toEqual(1);
                    expect(workout.groups[1].warmups.map(x => x.exercise.id).sort((a,b) => a - b)).toEqual([1]);
                });
            });
        });

        describe('when plan session contains groups with the same order', () => {
            beforeEach(() => {
                let group = new PlanSessionGroup({
                    id: 1,
                    name: 'a',
                    order: 1,
                    });
                let anotherGroup = new PlanSessionGroup({
                    id: 2,
                    name: 'b',
                    order: 1,
                    });
                planSession.groups = [group, anotherGroup];
            })

            it('should alternate between groups according to the last workout', () => {
                exerciseGenerate().subscribe(workout => {
                    expect(workout.groups.length).toEqual(1);
                    expect(workout.groups[0].name).toEqual('a');
                    expect(workout.groups[0].plan_session_group).toEqual(1);

                    lastWorkout = workout;

                    exerciseGenerate().subscribe(nextWorkout => {
                        expect(nextWorkout.groups.length).toEqual(1);
                        expect(nextWorkout.groups[0].name).toEqual('b');
                        expect(nextWorkout.groups[0].plan_session_group).toEqual(2);

                        lastWorkout = nextWorkout;

                        // should start from the beginning when reaching the end of order
                        exerciseGenerate().subscribe(anotherWorkout => {
                            expect(anotherWorkout.groups.length).toEqual(1);
                            expect(anotherWorkout.groups[0].name).toEqual('a');
                            expect(anotherWorkout.groups[0].plan_session_group).toEqual(2);
                        });
                    });
                });
            });
        });

        describe('when plan session contains groups with sets', () => {
            describe('when sets have exercises with the same order', () => {
                beforeEach(() => {
                    let group = new PlanSessionGroup({
                        order: 1,
                        exercises: [
                            new PlanSessionGroupActivity({
                                id: 1,
                                order: 1,
                                exercise: new Exercise({id: 1})}
                            ),
                            new PlanSessionGroupActivity({
                                id: 2,
                                order: 1,
                                exercise: new Exercise({id: 2})}
                            ),
                        ]});
                    planSession.groups = [group];
                });

                it('should alternate exercises according to last workout', () => {
                    exerciseGenerate().subscribe(workout => {
                        expect(workout.groups.length).toEqual(1);
                        expect(workout.groups[0].sets.length).toEqual(1);
                        expect(workout.groups[0].sets[0].exercise.id).toEqual(1);

                        lastWorkout = workout;

                        exerciseGenerate().subscribe(nextWorkout => {
                            expect(nextWorkout.groups.length).toEqual(1);
                            expect(nextWorkout.groups[0].sets.length).toEqual(1);
                            expect(nextWorkout.groups[0].sets[0].exercise.id).toEqual(2);

                            lastWorkout = nextWorkout;

                            // should start from the beginning when reaching max order
                            exerciseGenerate().subscribe(anotherWorkout => {
                                expect(anotherWorkout.groups.length).toEqual(1);
                                expect(anotherWorkout.groups[0].sets.length).toEqual(1);
                                expect(anotherWorkout.groups[0].sets[0].exercise.id).toEqual(1);
                            });
                        });
                    });
                });
            })

            beforeEach(() => {
                let group = new PlanSessionGroup({
                    order: 1,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 1})}
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({id: 2})}
                        ),
                    ]});
                let anotherGroup = new PlanSessionGroup({
                    order: 2,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 1})}
                        ),
                    ]});
                planSession.groups = [group, anotherGroup];
            });

            it('should generate workout sets', () => {
                exerciseGenerate().subscribe(workout => {
                    expect(workout.groups.length).toEqual(2);
                    expect(workout.groups[0].sets.length).toEqual(2);
                    expect(workout.groups[0].sets.map(x => x.exercise.id).sort((a,b) => a - b)).toEqual([1,2]);
                    expect(workout.groups[1].sets.length).toEqual(1);
                    expect(workout.groups[1].sets.map(x => x.exercise.id).sort((a,b) => a - b)).toEqual([1]);
                });
            });
        });

        describe('when working weights partially filled', () => {
            beforeEach(() => {
               working_weights = [new WorkingWeight({unit: anotherUnitId, weight: 20, exercise: new Exercise({id:1})})]; 
            });

            it('should fill the missing exercises', () => {
                let group = new PlanSessionGroup({
                    order: 1,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 1})
                        }),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({id: 2})
                        }),
                        new PlanSessionGroupActivity({
                            order: 3,
                            exercise: new Exercise({id: 3})
                        }),
                    ]});
                planSession.groups = [group];

                exerciseGenerate().subscribe(workout => {
                    expect(workout.working_weights.length).toEqual(3);
                    expect(workout.working_weights.map(x => x.exercise.id).sort((a,b) => a - b)).toEqual([1,2,3]);
                    expect(workout.working_weights.filter(x => x.weight == null || x.weight == 0).length).toEqual(2, 'new working weights start with no weight');
                    expect(workout.working_weights.filter(x => x.weight == 20).length).toEqual(1, 'existing weight value was preserved');
                    expect(workout.working_weights.filter(x => x.unit == userWeightUnitId).length).toEqual(2, 'user weight unit id was added to new working weights');
                    expect(workout.working_weights.filter(x => x.unit == anotherUnitId).length).toEqual(1, 'existing unit value was preserved');
                });
            });
        });

        describe('when working weights empty', () => {
            beforeEach(() => {
               working_weights = []; 
            });

            it('should fill working weights with all exercises of plan', () => {
                let group = new PlanSessionGroup({
                    order: 1,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 1})}
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({id: 1})}
                        ),
                        new PlanSessionGroupActivity({
                            order: 3,
                            exercise: new Exercise({id: 2})}
                        ),
                    ]});
                let anotherGroup = new PlanSessionGroup({
                    order: 2,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({id: 2})}
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({id: 3})}
                        ),
                        new PlanSessionGroupActivity({
                            order: 3,
                            exercise: new Exercise({id: 4})}
                        ),
                    ]});
                planSession.groups = [group, anotherGroup];

                exerciseGenerate().subscribe(workout => {
                    expect(workout.working_weights.length).toEqual(4);
                    expect(workout.working_weights.map(x => x.exercise.id).sort((a,b) => a - b)).toEqual([1,2,3,4]);
                    expect(workout.working_weights.filter(x => x.weight != null && x.weight > 0).length).toEqual(0);
                    expect(workout.working_weights.filter(x => x.unit == userWeightUnitId).length).toEqual(4);
                });
            });
        });

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
        return service.generate(start, working_weights, plan, planSession);
    }
});
