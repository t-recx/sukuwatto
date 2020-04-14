import { WorkoutGeneratorService } from "./workout-generator.service";
import { WorkoutsService } from "./workouts.service";
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';
import { Workout } from './workout';
import { Plan } from './plan';
import { PlanSession } from './plan-session';
import { ProgressionStrategy, ProgressionType } from './plan-progression-strategy';
import { WorkingWeight } from './working-weight';
import { PlanSessionGroup } from './plan-session-group';
import { WorkoutGroup } from './workout-group';
import { PlanSessionGroupActivity } from './plan-session-group-activity';
import { Exercise, Section, Modality, Force, Mechanics } from './exercise';
import { PlanSessionGroupExercise } from './plan-session-group-exercise';
import { WorkoutSet } from './workout-set';
import { CompileReflector } from '@angular/compiler';
import { UnitsService } from './units.service';
import { Unit, MeasurementType } from './unit';

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
    let userWeightUnit: Unit = new Unit({id:60, measurement_type: MeasurementType.Weight});
    let anotherUnit: Unit = new Unit({id:30, measurement_type: MeasurementType.Weight});
    let convertedWeight: number = 3948;

    let service: WorkoutGeneratorService;
    let workoutServiceSpy: jasmine.SpyObj<WorkoutsService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let unitServiceSpy: jasmine.SpyObj<UnitsService>;

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
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsername', 'getUserWeightUnitId']);
        unitServiceSpy = jasmine.createSpyObj('UnitsService', ['convert', 'getUnits']);

        lastWorkout = new Workout();
        lastWorkout.id = 1;
        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));
        authServiceSpy.getUsername.and.returnValue(username);
        authServiceSpy.getUserWeightUnitId.and.returnValue(userWeightUnitId.toString());
        unitServiceSpy.getUnits.and.returnValue(of([userWeightUnit, anotherUnit]));
        unitServiceSpy.convert.and.returnValue(convertedWeight);

        service = new WorkoutGeneratorService(workoutServiceSpy, authServiceSpy, unitServiceSpy);
    });
    /*
        describe('#updateWeights', () => {
        })
    
        describe('#getWorkoutName', () => {
        })
        */

    describe('#generate', () => {
        it('should set workout fields based on parameters received', () => {
            serviceGenerate().subscribe(workout => {
                expect(workout.start).toEqual(start);
                expect(workout.plan).toEqual(plan.id)
                expect(workout.plan_session).toEqual(planSession.id)
            });
        });

        it('should set workout name according to start date and plan session', () => {
            start = new Date(2020, 4, 8);

            planSession.name = "workout a";

            serviceGenerate().subscribe(workout => {
                expect(workout.name).toEqual(start.toLocaleDateString('en-us', { weekday: 'long' }) + "'s" + " " + planSession.name + " session");
            });
        });

        describe('when plan session contains groups with warmups', () => {
            beforeEach(() => {
                let group = new PlanSessionGroup({
                    order: 1,
                    warmups: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            number_of_sets: 2,
                            exercise: new Exercise({ id: 1 })
                        }
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            number_of_sets: 1,
                            exercise: new Exercise({ id: 2 })
                        }
                        ),
                    ]
                });
                let anotherGroup = new PlanSessionGroup({
                    order: 2,
                    warmups: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            number_of_sets: 3,
                            exercise: new Exercise({ id: 1 })
                        }
                        ),
                    ]
                });
                planSession.groups = [group, anotherGroup];
            });

            it('should generate workout warmups', () => {
                serviceGenerate().subscribe(workout => {
                    expect(workout.groups.length).toEqual(2);
                    expect(workout.groups[0].warmups.length).toEqual(3);
                    expect(workout.groups[0].warmups.map(x => x.exercise.id).sort((a, b) => a - b)).toEqual([1, 1, 2]);
                    expect(workout.groups[1].warmups.length).toEqual(3);
                    expect(workout.groups[1].warmups.map(x => x.exercise.id).sort((a, b) => a - b)).toEqual([1, 1, 1]);
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
                serviceGenerate().subscribe(workout => {
                    expect(workout.groups.length).toEqual(1);
                    expect(workout.groups[0].name).toEqual('a');
                    expect(workout.groups[0].plan_session_group).toEqual(1);

                    lastWorkout = workout;
                    workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));

                    serviceGenerate().subscribe(nextWorkout => {
                        expect(nextWorkout.groups.length).toEqual(1);
                        expect(nextWorkout.groups[0].name).toEqual('b');
                        expect(nextWorkout.groups[0].plan_session_group).toEqual(2);

                        lastWorkout = nextWorkout;
                        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));

                        // should start from the beginning when reaching the end of order
                        serviceGenerate().subscribe(anotherWorkout => {
                            expect(anotherWorkout.groups.length).toEqual(1);
                            expect(anotherWorkout.groups[0].name).toEqual('a');
                            expect(anotherWorkout.groups[0].plan_session_group).toEqual(1);
                        });
                    });
                });
            });
        });

        describe('when plan session contains groups with sets', () => {
            describe('when sets have exercises with the same order', () => {
                beforeEach(() => {
                    let group = new PlanSessionGroup({
                        id: 1,
                        order: 1,
                        exercises: [
                            new PlanSessionGroupActivity({
                                id: 1,
                                order: 1,
                                number_of_sets: 1,
                                exercise: new Exercise({ id: 1 })
                            }
                            ),
                            new PlanSessionGroupActivity({
                                id: 2,
                                order: 1,
                                number_of_sets: 1,
                                exercise: new Exercise({ id: 2 })
                            }
                            ),
                        ]
                    });
                    planSession.groups = [group];
                });

                it('should alternate exercises according to last workout', () => {
                    serviceGenerate().subscribe(workout => {
                        expect(workout.groups.length).toEqual(1);
                        expect(workout.groups[0].sets.length).toEqual(1);
                        expect(workout.groups[0].sets[0].exercise.id).toEqual(1);

                        lastWorkout = workout;
                        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));

                        serviceGenerate().subscribe(nextWorkout => {
                            expect(nextWorkout.groups.length).toEqual(1);
                            expect(nextWorkout.groups[0].sets.length).toEqual(1);
                            expect(nextWorkout.groups[0].sets[0].exercise.id).toEqual(2);

                            lastWorkout = nextWorkout;
                            workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));

                            // should start from the beginning when reaching max order
                            serviceGenerate().subscribe(anotherWorkout => {
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
                    id: 1,
                    order: 1,
                    exercises: [
                        new PlanSessionGroupActivity({
                            id: 1,
                            order: 1,
                            number_of_sets: 3,
                            exercise: new Exercise({ id: 1 })
                        }
                        ),
                        new PlanSessionGroupActivity({
                            id: 2,
                            order: 2,
                            number_of_sets: 1,
                            exercise: new Exercise({ id: 2 })
                        }
                        ),
                    ]
                });
                let anotherGroup = new PlanSessionGroup({
                    id: 2,
                    order: 2,
                    exercises: [
                        new PlanSessionGroupActivity({
                            id: 3,
                            order: 1,
                            number_of_sets: 1,
                            exercise: new Exercise({ id: 1 })
                        }
                        ),
                    ]
                });
                planSession.groups = [group, anotherGroup];
            });

            it('should generate workout sets', () => {
                serviceGenerate().subscribe(workout => {
                    expect(workout.groups[0].sets.length).toEqual(4);
                    expect(workout.groups.length).toEqual(2);
                    expect(workout.groups[0].sets.filter(x => x.order == 1).length).toEqual(3);
                    expect(workout.groups[0].sets.map(x => x.exercise.id).sort((a, b) => a - b)).toEqual([1, 1, 1, 2]);
                    expect(workout.groups[1].sets.length).toEqual(1);
                    expect(workout.groups[1].sets.map(x => x.exercise.id).sort((a, b) => a - b)).toEqual([1]);
                });
            });
        });

        describe('when progression strategies are set', () => {
            describe('when progression strategies are set at plan level', () => {
                let previousWeight;
                let weightIncrease;
                let weightIncreaseAnotherUnit;
                let coreExercise;
                let anotherCoreExercise;
                let strategy;
                let strategyWithDifferentUnit;
                let group;
                let anotherGroup;

                beforeEach(() => {
                    previousWeight = 10;
                    weightIncrease = 2;
                    weightIncreaseAnotherUnit = 400;
                    coreExercise = new Exercise({ id: 1, section: Section.Core });
                    anotherCoreExercise = new Exercise({ id: 2, section: Section.Core });
                    strategy = new ProgressionStrategy({ id: 1, progression_type: ProgressionType.ByCharacteristics, section: Section.Core, weight_increase: weightIncrease, unit: userWeightUnitId });
                    strategyWithDifferentUnit = new ProgressionStrategy({ id: 2, progression_type: ProgressionType.ByCharacteristics, section: Section.Core, weight_increase: weightIncreaseAnotherUnit, unit: anotherUnitId });
                    group = new PlanSessionGroup({ id: 1, order: 1, exercises: [new PlanSessionGroupExercise({ exercise: coreExercise, working_weight_percentage: 100, number_of_sets: 1, number_of_repetitions: 1 })] })
                    anotherGroup = new PlanSessionGroup({ id: 2, order: 2, exercises: [new PlanSessionGroupExercise({ exercise: anotherCoreExercise, working_weight_percentage: 100, number_of_sets: 1, number_of_repetitions: 1 })] })
                    planSession.groups = [group, anotherGroup];

                    working_weights.push(new WorkingWeight({ weight: previousWeight, exercise: coreExercise, unit: userWeightUnitId }));
                    working_weights.push(new WorkingWeight({ weight: previousWeight, exercise: anotherCoreExercise, unit: userWeightUnitId }));

                    serviceGenerate().subscribe(workout => {
                        lastWorkout = workout;
                        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));
                    })
                    complete(lastWorkout);
                })

                describe('when strategy is of a different unit than the users and there is no equivalent strategy', () => {
                    beforeEach(() => {
                        plan.progressions.push(strategyWithDifferentUnit);
                    })

                    it('should convert to the users unit', () => {
                        serviceGenerate().subscribe(workout => {
                            expect(workout.working_weights.filter(x => x.exercise.id == coreExercise.id)[0].weight)
                            .toEqual(previousWeight + convertedWeight);
                        });
                    })
                })

                describe('when there are two equal strategies differing only in the unit applying for the same exercise', () =>
                {
                    beforeEach(() => {
                        plan.progressions.push(strategyWithDifferentUnit, strategy);
                    })

                    it('should choose the strategy with the user unit', () => {
                        serviceGenerate().subscribe(workout => {
                            expect(workout.working_weights.filter(x => x.exercise.id == coreExercise.id)[0].weight)
                            .toEqual(previousWeight + weightIncrease);
                        });
                    })
                })

                describe('and when progression strategies are set at session level', () => {
                    beforeEach(() => {

                    })

                    it('should take precedence over plan strategies', () => {

                    })

                    describe('and when progression strategies are set at group level', () => {
                        beforeEach(() => {

                        })

                        it('should take precedence over plan and session strategies', () => {

                        })
                    })
                })
            })

            describe('when progression strategies are set at session level', () => {
                describe('and when progression strategies are set at group level', () => {

                })
            })

            describe('when progression strategies are set at group level', () => {
                it('should not affect exercises on other groups', () => {
                    let previousWeight = 10;
                    let increase = 2;
                    let exercise = new Exercise({ id: 1, section: Section.Core });
                    let anotherExercise = new Exercise({ id: 2, section: Section.Core });
                    let strategy = new ProgressionStrategy({ id: 1, progression_type: ProgressionType.ByCharacteristics, section: Section.Core, weight_increase: increase, unit: userWeightUnitId });
                    let group = new PlanSessionGroup({ id: 1, order: 1, exercises: [new PlanSessionGroupExercise({ exercise: exercise, working_weight_percentage: 100, number_of_sets: 1, number_of_repetitions: 1 })] })
                    let anotherGroup = new PlanSessionGroup({ id: 2, order: 2, exercises: [new PlanSessionGroupExercise({ exercise: anotherExercise, working_weight_percentage: 100, number_of_sets: 1, number_of_repetitions: 1 })] })
                    planSession.groups = [group, anotherGroup];
                    working_weights.push(new WorkingWeight({ weight: previousWeight, exercise, unit: userWeightUnitId }));
                    working_weights.push(new WorkingWeight({ weight: previousWeight, exercise: anotherExercise, unit: userWeightUnitId }));
                    serviceGenerate().subscribe(workout => {
                        lastWorkout = workout;
                        workoutServiceSpy.getLastWorkout.and.returnValue(of(lastWorkout));
                    })
                    complete(lastWorkout);

                    group.progressions.push(strategy);
                    serviceGenerate().subscribe(workout => {
                        expect(workout.groups.filter(g => g.plan_session_group == group.id)[0].sets[0].weight)
                            .toEqual(previousWeight + increase);
                        expect(workout.groups.filter(g => g.plan_session_group == anotherGroup.id)[0].sets[0].weight)
                            .toEqual(previousWeight);
                        expect(workout.working_weights.filter(w => w.exercise.id == exercise.id)[0].weight)
                        .toEqual(previousWeight + increase);
                        expect(workout.working_weights.filter(w => w.exercise.id == anotherExercise.id)[0].weight)
                        .toEqual(previousWeight);
                    });
                })
            })
        })

        describe('when working weights partially filled', () => {
            beforeEach(() => {
                working_weights = [new WorkingWeight({ unit: anotherUnitId, weight: 20, exercise: new Exercise({ id: 1 }) })];
            });

            it('should fill the missing exercises', () => {
                let group = new PlanSessionGroup({
                    order: 1,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({ id: 1 })
                        }),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({ id: 2 })
                        }),
                        new PlanSessionGroupActivity({
                            order: 3,
                            exercise: new Exercise({ id: 3 })
                        }),
                    ]
                });
                planSession.groups = [group];

                serviceGenerate().subscribe(workout => {
                    expect(workout.working_weights.length).toEqual(3);
                    expect(workout.working_weights.map(x => x.exercise.id).sort((a, b) => a - b)).toEqual([1, 2, 3]);
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
                            exercise: new Exercise({ id: 1 })
                        }
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({ id: 1 })
                        }
                        ),
                        new PlanSessionGroupActivity({
                            order: 3,
                            exercise: new Exercise({ id: 2 })
                        }
                        ),
                    ]
                });
                let anotherGroup = new PlanSessionGroup({
                    order: 2,
                    exercises: [
                        new PlanSessionGroupActivity({
                            order: 1,
                            exercise: new Exercise({ id: 2 })
                        }
                        ),
                        new PlanSessionGroupActivity({
                            order: 2,
                            exercise: new Exercise({ id: 3 })
                        }
                        ),
                        new PlanSessionGroupActivity({
                            order: 3,
                            exercise: new Exercise({ id: 4 })
                        }
                        ),
                    ]
                });
                planSession.groups = [group, anotherGroup];

                serviceGenerate().subscribe(workout => {
                    expect(workout.working_weights.length).toEqual(4);
                    expect(workout.working_weights.map(x => x.exercise.id).sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
                    expect(workout.working_weights.filter(x => x.weight != null && x.weight > 0).length).toEqual(0);
                    expect(workout.working_weights.filter(x => x.unit == userWeightUnitId).length).toEqual(4);
                });
            });
        });

        describe('when no last workout available', () => {
            beforeEach(() => {
                workoutServiceSpy.getLastWorkout.and.returnValue(of(null));
            });

            describe('when multiple groups with same order', () => {
                it('should select first group with same order', () => {
                    const expected = new PlanSessionGroup({ id: 1, order: 1 });
                    const decoy = new PlanSessionGroup({ id: 2, order: 1 });

                    planSession.groups = [expected, decoy];

                    serviceGenerate().subscribe(workout => {
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
                        const decoy = new PlanSessionGroup({ id: 1, order: 1 });
                        const expected = new PlanSessionGroup({ id: 3, order: 1 });
                        const workoutGroup = new WorkoutGroup({ plan_session_group: decoy.id, order: 1 });

                        lastWorkout.groups = [workoutGroup];
                        planSession.groups = [expected, decoy];
                    });

                    it('should select the group with a bigger id than the one in the last workout', () => {
                        serviceGenerate().subscribe(workout => {
                            expect(workout.groups.length).toEqual(1);
                            expect(workout.groups[0].plan_session_group).toEqual(3);
                        });
                    });
                });

                describe('when already at final group', () => {
                    beforeEach(() => {
                        const expected = new PlanSessionGroup({ id: 2, order: 1 });
                        const decoy = new PlanSessionGroup({ id: 30, order: 1 });
                        const anotherDecoy = new PlanSessionGroup({ id: 12, order: 1 });
                        const workoutGroup = new WorkoutGroup({ plan_session_group: 30, order: 1 });

                        lastWorkout.groups = [workoutGroup];
                        planSession.groups = [anotherDecoy, expected, decoy];
                    });

                    it('should select the group with the lowest id', () => {
                        serviceGenerate().subscribe(workout => {
                            expect(workout.groups.length).toEqual(1);
                            expect(workout.groups[0].plan_session_group).toEqual(2);
                        });
                    });
                });
            });
        });
    });

    function complete(workout: Workout) {
        workout.groups.forEach(g => {
            g.sets.forEach(set => {
                set.done = true;
            })
            g.warmups.forEach(warmup => {
                warmup.done = true;
            })
        })
    }

    function serviceGenerate(): Observable<Workout> {
        return service.generate(start, working_weights, plan, planSession);
    }
});
